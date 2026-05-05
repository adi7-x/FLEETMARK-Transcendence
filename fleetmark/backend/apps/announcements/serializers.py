from rest_framework import serializers
from .models import Announcement, AnnouncementDismissal

class AnnouncementSerializer(serializers.ModelSerializer):
    is_dismissed = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'priority', 'created_at', 'is_dismissed']
        read_only_fields = ['id', 'created_at', 'is_dismissed']

    def get_is_dismissed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'user_dismissed'):
                return obj.user_dismissed
            return AnnouncementDismissal.objects.filter(user=request.user, announcement=obj).exists()
        return False
