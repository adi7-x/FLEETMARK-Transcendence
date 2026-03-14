from django.urls import path

from apps.trips.views import (
	AvailableTripListView,
	TripDetailView,
	TripListCreateView,
	TripStartView,
	TripEndView
)

urlpatterns = [
	path('', TripListCreateView.as_view(), name='trip-list-create'),
	path('available/', AvailableTripListView.as_view(), name='trip-available'),
	path('<uuid:pk>/', TripDetailView.as_view(), name='trip-detail'),
	path('<uuid:pk>/start/', TripStartView.as_view(), name='trip-start'),
	path('<uuid:pk>/end/', TripEndView.as_view(), name='trip-end'),
]
