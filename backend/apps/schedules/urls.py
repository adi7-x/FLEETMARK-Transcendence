from django.urls import path
from apps.schedules.views import ScheduleConfigView, StoppedPeriodListCreateView, StoppedPeriodDeleteView

urlpatterns = [
    path('', ScheduleConfigView.as_view(), name='schedule-config'),
    path('stopped-periods/', StoppedPeriodListCreateView.as_view(), name='stopped-period-list-create'),
    path('stopped-periods/<uuid:pk>/', StoppedPeriodDeleteView.as_view(), name='stopped-period-delete'),
]
