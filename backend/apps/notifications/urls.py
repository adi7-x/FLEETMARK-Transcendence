from django.urls import path
from apps.notifications.views import NotificationListCreateView, NotificationMarkReadView, NotificationMarkAllReadView

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
]
