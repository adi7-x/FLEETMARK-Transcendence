from django.urls import path
from apps.reports.views import ReportOverviewView

urlpatterns = [
	path('', ReportOverviewView.as_view(), name='report-overview'),
]
