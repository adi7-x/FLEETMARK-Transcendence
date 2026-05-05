from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Exists, OuterRef

from apps.users.permissions import IsLogisticsStaff
from .models import Announcement, AnnouncementDismissal
from .serializers import AnnouncementSerializer

class AnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsLogisticsStaff()]

    def get_queryset(self):
        user = self.request.user
        queryset = Announcement.objects.all()
        if user.is_authenticated:
            dismissals = AnnouncementDismissal.objects.filter(
                announcement=OuterRef('pk'),
                user=user
            )
            queryset = queryset.annotate(user_dismissed=Exists(dismissals))
        return queryset

class AnnouncementDetailView(generics.RetrieveDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsLogisticsStaff()]

class AnnouncementDismissView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, format=None):
        try:
            announcement = Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        AnnouncementDismissal.objects.get_or_create(user=request.user, announcement=announcement)
        return Response({'detail': 'Dismissed successfully.'}, status=status.HTTP_200_OK)
