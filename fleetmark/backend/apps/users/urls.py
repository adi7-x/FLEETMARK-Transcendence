from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import (
    GDPRAccountDeleteView,
    GDPRDataExportView,
    OAuth42CallbackView,
    OAuth42LoginView,
    ProfileView,
    TOTPDisableView,
    TOTPSetupView,
    TOTPVerifyView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    # 42 OAuth
    path('42/login/', OAuth42LoginView.as_view(), name='oauth-42-login'),
    path('42/callback/', OAuth42CallbackView.as_view(), name='oauth-42-callback'),

    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('me/', ProfileView.as_view(), name='profile'),

    # GDPR compliance
    path('me/export/', GDPRDataExportView.as_view(), name='gdpr-data-export'),
    path('me/delete/', GDPRAccountDeleteView.as_view(), name='gdpr-account-delete'),

    # Two-Factor Authentication
    path('2fa/setup/', TOTPSetupView.as_view(), name='totp-setup'),
    path('2fa/verify/', TOTPVerifyView.as_view(), name='totp-verify'),
    path('2fa/disable/', TOTPDisableView.as_view(), name='totp-disable'),

    # User management (logistics staff only)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
]
