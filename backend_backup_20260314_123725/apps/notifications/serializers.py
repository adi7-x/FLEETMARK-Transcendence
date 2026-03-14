from rest_framework import serializers
from apps.notifications.models import Notification
from django.utils.timezone import localtime

class NotificationSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'icon', 'type', 'status', 'time']

    def get_time(self, obj):
        dt = localtime(obj.created_at)
        return dt.strftime('%I:%M %p')
