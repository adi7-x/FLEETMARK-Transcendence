from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import OAuth42CallbackView, OAuth42LoginView, ProfileView

urlpatterns = [
    # 42 OAuth
    path('42/login/', OAuth42LoginView.as_view(), name='oauth-42-login'),
    path('42/callback/', OAuth42CallbackView.as_view(), name='oauth-42-callback'),

    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('me/', ProfileView.as_view(), name='profile'),
]
