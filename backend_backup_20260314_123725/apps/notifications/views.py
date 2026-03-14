from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer

class NotificationListView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            Q(user=user) | 
            Q(user__isnull=True, target_role__isnull=True) |
            Q(user__isnull=True, target_role=user.role) |
            Q(user__isnull=True, target_role='All Users')
        )

    def perform_create(self, serializer):
        target = self.request.data.get('target', 'All Users')
        role_map = {
            'Students Only': 'passenger',
            'Drivers Only': 'driver',
            'Admins Only': 'admin',
            'All Users': 'All Users'
        }
        serializer.save(
            target_role=role_map.get(target, 'All Users'),
            type='sent',
            icon='info',
            status='Unread'
        )
