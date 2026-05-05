from django.urls import path
from . import views

urlpatterns = [
    path('', views.AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('<uuid:pk>/', views.AnnouncementDetailView.as_view(), name='announcement-detail'),
    path('<uuid:pk>/dismiss/', views.AnnouncementDismissView.as_view(), name='announcement-dismiss'),
]
