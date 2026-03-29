from django.urls import path

from apps.trips.views import AvailableTripListView, BulkGenerateTripsView, BulkDeleteTripsView, TripDetailView, TripListCreateView

urlpatterns = [
	path('', TripListCreateView.as_view(), name='trip-list-create'),
	path('bulk-generate/', BulkGenerateTripsView.as_view(), name='trip-bulk-generate'),
	path('bulk-delete/', BulkDeleteTripsView.as_view(), name='trip-bulk-delete'),
	path('available/', AvailableTripListView.as_view(), name='trip-available'),
	path('<uuid:pk>/', TripDetailView.as_view(), name='trip-detail'),
]
