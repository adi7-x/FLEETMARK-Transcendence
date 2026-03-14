from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.users.permissions import IsLogisticsStaff


class NotificationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            notifications = Notification.objects.filter(user_id=user_id)
        else:
            notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Admin creates notifications targeted by role."""
        from apps.users.models import User
        title = request.data.get('title', '')
        message = request.data.get('message', '')
        target_role = request.data.get('target_role')

        if target_role:
            users = User.objects.filter(role=target_role)
        else:
            users = User.objects.all()

        created = []
        for user in users:
            n = Notification.objects.create(user=user, title=title, message=message)
            created.append(n)

        if created:
            serializer = NotificationSerializer(created[0])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'detail': 'No users matched'}, status=status.HTTP_400_BAD_REQUEST)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked as read'})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
