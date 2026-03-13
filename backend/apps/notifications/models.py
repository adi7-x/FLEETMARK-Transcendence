from uuid import uuid4
from django.db import models
from django.conf import settings

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    target_role = models.CharField(max_length=20, null=True, blank=True)
    
    title = models.CharField(max_length=100)
    message = models.TextField()
    icon = models.CharField(max_length=20, default='info')
    
    type = models.CharField(max_length=20, default='system')
    status = models.CharField(max_length=20, default='Unread')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
