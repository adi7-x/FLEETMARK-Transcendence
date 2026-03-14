from datetime import time

from django.db.models import Count, F
from django.utils.timezone import localtime, now
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.routes.models import Route
from apps.trips.models import Trip
from apps.trips.serializers import TripSerializer
from apps.users.permissions import IsLogisticsStaff, IsDriver, IsLogisticsStaffOrReadOnly


class TripListCreateView(generics.ListCreateAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsAuthenticated, IsLogisticsStaffOrReadOnly]


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Trip.objects.select_related('route', 'bus', 'driver')
	serializer_class = TripSerializer
	permission_classes = [IsAuthenticated, IsLogisticsStaffOrReadOnly]


class AvailableTripListView(APIView):
	"""Browse trips available for a student station (station_id query param)."""

	permission_classes = [IsAuthenticated]

	def get(self, request):
		station_id = request.query_params.get('station_id')
		if not station_id:
			return Response({'detail': 'station_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		current_time = localtime(now()).time()

		if time(20, 0) <= current_time:
			allowed_window = 'peak'
		elif current_time < time(1, 0):
			return Response([], status=status.HTTP_200_OK)
		elif time(1, 0) <= current_time < time(6, 0):
			allowed_window = 'consolidated'
		else:
			return Response([], status=status.HTTP_200_OK)

		matched_routes = Route.objects.filter(
			window=allowed_window,
			route_stations__station_id=station_id,
		)

		trips = (
			Trip.objects.filter(
				route__in=matched_routes,
				archived_at__isnull=True,
			)
			.select_related('bus')
			.annotate(reservation_count=Count('reservations'))
			.filter(reservation_count__lt=F('bus__seat_capacity'))
			.order_by('departure_datetime')
		)

		serializer = TripSerializer(trips, many=True)
		return Response(serializer.data)


class TripStartView(APIView):
	permission_classes = [IsLogisticsStaff | IsDriver]

	def post(self, request, pk):
		from apps.core.exceptions import LifecycleError
		try:
			trip = Trip.objects.get(pk=pk)
			trip.start()
			return Response({'status': 'Trip started'})
		except Trip.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		except LifecycleError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TripEndView(APIView):
	permission_classes = [IsLogisticsStaff | IsDriver]

	def post(self, request, pk):
		from apps.core.exceptions import LifecycleError
		try:
			trip = Trip.objects.get(pk=pk)
			trip.end()
			return Response({'status': 'Trip ended'})
		except Trip.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)
		except LifecycleError as e:
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
