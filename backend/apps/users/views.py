import os
from urllib.parse import urlencode

import requests
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.users.serializers import (
    OAuth42LoginSerializer,
    TokenResponseSerializer,
    UserAdminSerializer,
    UserSerializer,
)
from apps.users.permissions import IsLogisticsStaff

# ──────────────────────────────────────────────────────────────────────────────
# 42 OAuth settings (read from environment)
# ──────────────────────────────────────────────────────────────────────────────
INTRA_42_CLIENT_ID = os.environ.get('INTRA_42_CLIENT_ID', '')
INTRA_42_CLIENT_SECRET = os.environ.get('INTRA_42_CLIENT_SECRET', '')
INTRA_42_REDIRECT_URI = os.environ.get(
    'INTRA_42_REDIRECT_URI',
    'http://localhost:5173/auth/callback',
)
INTRA_42_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
INTRA_42_TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
INTRA_42_USER_URL = 'https://api.intra.42.fr/v2/me'

ADMIN_42_LOGIN = os.environ.get('ADMIN_42_LOGIN', '')


class OAuth42LoginView(APIView):
    """
    GET /api/v1/auth/42/login/

    Returns the 42 Intra OAuth authorization URL.
    The frontend redirects the user's browser to this URL.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        params = {
            'client_id': INTRA_42_CLIENT_ID,
            'redirect_uri': INTRA_42_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'public',
        }
        authorization_url = f'{INTRA_42_AUTHORIZE_URL}?{urlencode(params)}'
        return Response(
            {'authorization_url': authorization_url},
            status=status.HTTP_200_OK,
        )


class OAuth42CallbackView(APIView):
    """
    GET /api/v1/auth/42/callback/?code=<authorization_code>

    1. Exchanges the authorization code for a 42 access token.
    2. Fetches the user's 42 profile (login, email).
    3. Creates or retrieves the local User record.
    4. Assigns LOGISTICS_STAFF role if login matches ADMIN_42_LOGIN.
    5. Issues a JWT pair (access + refresh) and returns it with the user profile.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'Missing authorization code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Step 1: Exchange code for 42 access token ────────────────────
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': INTRA_42_CLIENT_ID,
            'client_secret': INTRA_42_CLIENT_SECRET,
            'code': code,
            'redirect_uri': INTRA_42_REDIRECT_URI,
        }
        token_response = requests.post(INTRA_42_TOKEN_URL, data=token_data, timeout=10)
        if token_response.status_code != 200:
            return Response(
                {'error': 'Failed to obtain access token from 42.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        access_token_42 = token_response.json().get('access_token')

        # ── Step 2: Fetch 42 user profile ────────────────────────────────
        headers = {'Authorization': f'Bearer {access_token_42}'}
        profile_response = requests.get(INTRA_42_USER_URL, headers=headers, timeout=10)
        if profile_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch user profile from 42.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        profile = profile_response.json()
        login_42 = profile.get('login')
        email = profile.get('email')

        if not login_42 or not email:
            return Response(
                {'error': 'Incomplete profile data from 42.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ── Step 3: Get or create local user ─────────────────────────────
        role = 'LOGISTICS_STAFF' if login_42 == ADMIN_42_LOGIN else 'STUDENT'

        user, created = User.objects.get_or_create(
            login_42=login_42,
            defaults={
                'email': email,
                'role': role,
            },
        )

        # If user existed but email changed on 42 side, update it
        if not created and user.email != email:
            user.email = email
            user.save(update_fields=['email'])

        # Promote to staff if login matches admin login and role was wrong
        if login_42 == ADMIN_42_LOGIN and user.role != 'LOGISTICS_STAFF':
            user.role = 'LOGISTICS_STAFF'
            user.is_staff = True
            user.save(update_fields=['role', 'is_staff'])

        # ── Step 4: Issue JWT tokens ─────────────────────────────────────
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            },
            status=status.HTTP_200_OK,
        )


class DevLoginView(APIView):
    """
    POST /api/v1/auth/dev-login/
    Body: { "email": "passenger@test.com" }

    DEV ONLY — bypasses 42 OAuth and issues JWT tokens for the given user.
    Only works when DEBUG=True.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from django.conf import settings
        if not settings.DEBUG:
            return Response(
                {'error': 'Dev login is disabled in production.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get('email')
        login_42 = request.data.get('login_42')

        if not email and not login_42:
            return Response(
                {'error': 'Provide email or login_42.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if login_42:
                user = User.objects.get(login_42=login_42)
            else:
                user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    """
    GET  /api/v1/auth/me/   — Return current user's profile.
    PATCH /api/v1/auth/me/  — Update allowed fields (station).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserListView(generics.ListAPIView):
    """
    GET /api/v1/auth/users/ — List all users (logistics staff only).
    """
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsLogisticsStaff]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/auth/users/<id>/ — View a user.
    PATCH  /api/v1/auth/users/<id>/ — Edit role, station, is_active.
    DELETE /api/v1/auth/users/<id>/ — Delete a user.
    Logistics staff only.
    """
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsLogisticsStaff]
