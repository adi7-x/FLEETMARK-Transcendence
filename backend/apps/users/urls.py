from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView, TokenVerifyView

from apps.users.views import (
    DevLoginView,
    OAuth42CallbackView,
    OAuth42LoginView,
    ProfileView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    # 42 OAuth
    path('42/login/', OAuth42LoginView.as_view(), name='oauth-42-login'),
    path('42/callback/', OAuth42CallbackView.as_view(), name='oauth-42-callback'),

    # Dev login (DEBUG only)
    path('dev-login/', DevLoginView.as_view(), name='dev-login'),

    # JWT token refresh/auth
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),

    # Profile
    path('me/', ProfileView.as_view(), name='profile'),

    # User management (logistics staff only)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
]
