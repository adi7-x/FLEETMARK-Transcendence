from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.reports.views import IncidentReportViewSet, AnalyticsView

router = DefaultRouter()
router.register(r'incidents', IncidentReportViewSet)

urlpatterns = [
	path('', AnalyticsView.as_view(), name='analytics'),
	path('', include(router.urls)),
]
