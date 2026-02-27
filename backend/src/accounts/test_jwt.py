from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User


class JWTAuthenticationTests(TestCase):
    """Test JWT token authentication."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            role="admin"
        )
    
    def test_obtain_jwt_token_with_valid_credentials(self):
        """Test obtaining JWT token with valid username and password."""
        response = self.client.post(
            "/api/v1/accounts/token/",
            {
                "username": "testuser",
                "password": "testpass123"
            },
            format="json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        
        # Store tokens for other tests
        self.access_token = response.data["access"]
        self.refresh_token = response.data["refresh"]
    
    def test_obtain_token_with_invalid_credentials(self):
        """Test that invalid credentials are rejected."""
        response = self.client.post(
            "/api/v1/accounts/token/",
            {
                "username": "testuser",
                "password": "wrongpassword"
            },
            format="json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_access_protected_endpoint_with_valid_token(self):
        """Test accessing protected endpoint with valid JWT token."""
        # Get token
        token_response = self.client.post(
            "/api/v1/accounts/token/",
            {
                "username": "testuser",
                "password": "testpass123"
            },
            format="json"
        )
        access_token = token_response.data["access"]
        
        # Access protected endpoint (buses list)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get("/api/v1/buses/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_access_protected_endpoint_without_token(self):
        """Test that protected endpoints reject requests without token."""
        response = self.client.get("/api/v1/buses/")
        
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_access_protected_endpoint_with_invalid_token(self):
        """Test that invalid tokens are rejected."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token_here')
        response = self.client.get("/api/v1/buses/")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_refresh_token(self):
        """Test refreshing access token using refresh token."""
        # Get initial tokens
        token_response = self.client.post(
            "/api/v1/accounts/token/",
            {
                "username": "testuser",
                "password": "testpass123"
            },
            format="json"
        )
        refresh_token = token_response.data["refresh"]
        
        # Use refresh token to get new access token
        refresh_response = self.client.post(
            "/api/v1/accounts/token/refresh/",
            {"refresh": refresh_token},
            format="json"
        )
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)
        
        # Verify new access token works
        new_access_token = refresh_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access_token}')
        response = self.client.get("/api/v1/buses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_verify_token(self):
        """Test token verification endpoint."""
        # Get token
        token_response = self.client.post(
            "/api/v1/accounts/token/",
            {
                "username": "testuser",
                "password": "testpass123"
            },
            format="json"
        )
        access_token = token_response.data["access"]
        
        # Verify token
        verify_response = self.client.post(
            "/api/v1/accounts/token/verify/",
            {"token": access_token},
            format="json"
        )
        
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
    
    def test_verify_invalid_token(self):
        """Test that invalid tokens fail verification."""
        verify_response = self.client.post(
            "/api/v1/accounts/token/verify/",
            {"token": "invalid_token"},
            format="json"
        )
        
        self.assertEqual(verify_response.status_code, status.HTTP_401_UNAUTHORIZED)


class JWTTokenContentTests(TestCase):
    """Test JWT token contains expected user information."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create users with different roles
        self.superadmin = User.objects.create_superuser(
            username="superadmin",
            password="pass123",
            role="admin"
        )
        
        self.driver = User.objects.create_user(
            username="driver",
            password="pass123",
            role="driver"
        )
        
        self.passenger = User.objects.create_user(
            username="passenger",
            password="pass123",
            role="passenger"
        )
    
    def test_token_for_different_roles(self):
        """Test that users with different roles can obtain tokens."""
        for user in [self.superadmin, self.driver, self.passenger]:
            response = self.client.post(
                "/api/v1/accounts/token/",
                {
                    "username": user.username,
                    "password": "pass123"
                },
                format="json"
            )
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)
            
            # Verify the token works
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')
            buses_response = self.client.get("/api/v1/buses/")
            self.assertEqual(buses_response.status_code, status.HTTP_200_OK)
