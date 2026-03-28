from datetime import timedelta

from django.db.models import Count, F
from django.utils.timezone import localtime, now
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.routes.models import Route
from apps.trips.models import Trip
from apps.trips.serializers import TripSerializer
from apps.users.permissions import IsLogisticsStaff


class TripListCreateView(generics.ListCreateAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsLogisticsStaff]


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsLogisticsStaff]


class AvailableTripListView(APIView):
	"""Browse trips available for a student station (station_id query param)."""

	permission_classes = [IsAuthenticated]

	def get(self, request):
		station_id = request.query_params.get('station_id')
		if not station_id:
			return Response({'detail': 'station_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		now_dt = localtime(now())

		# Return all upcoming non-archived trips for this station (not yet departed, seats available)
		trips = (
			Trip.objects.filter(
				route__route_stations__station_id=station_id,
				departure_datetime__gte=now_dt,
				archived_at__isnull=True,
			)
			.select_related('route', 'bus')
			.annotate(reservation_count=Count('reservations'))
			.filter(reservation_count__lt=F('bus__seat_capacity'))
			.order_by('departure_datetime')
		)

		serializer = TripSerializer(trips, many=True)
		return Response(serializer.data)
