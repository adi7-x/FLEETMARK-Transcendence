from datetime import date, datetime, time, timedelta

from django.db import transaction
from django.db.models import Count, F
from django.utils.timezone import get_current_timezone, localtime, make_aware, now
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
		
		# SMART DISPLAY LOGIC: 
		# If time < 06:00, show [Yesterday 21:00 -> Today 06:00]
		# If time >= 06:00, show [Today 21:00 -> Tomorrow 06:00]
		if now_dt.hour < 6:
			shift_date = now_dt.date() - timedelta(days=1)
		else:
			shift_date = now_dt.date()

		start_unaware = datetime.combine(shift_date, time(hour=21))
		end_unaware = datetime.combine(shift_date + timedelta(days=1), time(hour=6))

		tz = get_current_timezone()
		start_window = make_aware(start_unaware, tz)
		end_window = make_aware(end_unaware, tz)

		# Return all upcoming non-archived trips for this station (not yet departed, seats available)
		trips = (
			Trip.objects.filter(
				route__route_stations__station_id=station_id,
				departure_datetime__range=(start_window, end_window),
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


class BulkGenerateTripsView(APIView):
	permission_classes = [IsLogisticsStaff]

	def post(self, request):
		gen_type = request.data.get('type')

		if not gen_type:
			return Response(
				{'detail': 'Missing required fields (type).'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		from apps.buses.models import Bus
		from apps.drivers.models import Driver
		from apps.routes.models import Route

		# Ensure resources exist
		route_ocp, _ = Route.objects.get_or_create(name='OCP Route', defaults={'window': 'peak'})
		route_cb, _ = Route.objects.get_or_create(name='Coin Blue Route', defaults={'window': 'peak'})
		route_unified, _ = Route.objects.get_or_create(name='Unified Night Route', defaults={'window': 'consolidated'})
		
		bus_ocp, _ = Bus.objects.get_or_create(name='OCP Route Bus', defaults={'plate': 'OCP-001', 'seat_capacity': 50})
		bus_cb, _ = Bus.objects.get_or_create(name='Coin Blue Route Bus', defaults={'plate': 'CB-001', 'seat_capacity': 50})
		bus_unified, _ = Bus.objects.get_or_create(name='Unified Night Route Bus', defaults={'plate': 'UNI-001', 'seat_capacity': 50})
		
		default_driver, _ = Driver.objects.get_or_create(name='Night Shift Driver', defaults={'license_number': 'NS-DEFAULT', 'contact_number': ''})

		# allowed hours: 21, 22, 23, 0, 1, 3, 4, 5, 6
		hours = [21, 22, 23, 0, 1, 3, 4, 5, 6]
		generated_count = 0
		dates_to_generate = []

		if gen_type == 'regular':
			start_str = request.data.get('start_date')
			end_str = request.data.get('end_date')
			skip_weekends = request.data.get('skip_weekends', True)

			if not start_str or not end_str:
				return Response(
					{'detail': 'start_date and end_date required for regular generation.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			try:
				start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
				end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
			except ValueError:
				return Response(
					{'detail': 'Invalid date format. Use YYYY-MM-DD.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			current = start_date
			while current <= end_date:
				if not (skip_weekends and current.weekday() >= 5):
					dates_to_generate.append(current)
				current += timedelta(days=1)

		elif gen_type == 'specific':
			dates_list = request.data.get('dates', [])
			if not dates_list:
				return Response(
					{'detail': 'dates array is required for specific generation.'},
					status=status.HTTP_400_BAD_REQUEST,
				)
			for d_str in dates_list:
				try:
					dates_to_generate.append(datetime.strptime(d_str, '%Y-%m-%d').date())
				except ValueError:
					pass
		else:
			return Response(
				{'detail': 'Invalid generation type. Use "regular" or "specific".'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		try:
			with transaction.atomic():
				for target_date in dates_to_generate:
					for h in hours:
						# For midnight and early AM, the actual day is target_date + 1
						actual_date = target_date + timedelta(days=1) if h < 12 else target_date
						
						# Make aware datetime for departure
						dt_unaware = datetime(
							year=actual_date.year,
							month=actual_date.month,
							day=actual_date.day,
							hour=h,
							minute=0,
						)
						dt_aware = make_aware(dt_unaware)

						is_peak = h in [21, 22, 1]

						if is_peak:
							# Peak Hours: 2 trips (OCP Route + Coin Blue Route)
							trip1, created1 = Trip.objects.get_or_create(
								route=route_ocp,
								departure_datetime=dt_aware,
								defaults={
									'bus': bus_ocp,
									'driver': default_driver,
								},
							)
							if created1:
								generated_count += 1

							trip2, created2 = Trip.objects.get_or_create(
								route=route_cb,
								departure_datetime=dt_aware,
								defaults={
									'bus': bus_cb,
									'driver': default_driver,
								},
							)
							if created2:
								generated_count += 1
						else:
							# Normal Hours: 1 trip (Unified Night Route)
							trip_unified, created_unified = Trip.objects.get_or_create(
								route=route_unified,
								departure_datetime=dt_aware,
								defaults={
									'bus': bus_unified,
									'driver': default_driver,
								},
							)
							if created_unified:
								generated_count += 1
			return Response(
				{'detail': f'successfully generated {generated_count} trips.'},
				status=status.HTTP_201_CREATED,
			)
		except Exception as e:
			return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BulkDeleteTripsView(APIView):
	permission_classes = [IsLogisticsStaff]

	def delete(self, request):
		try:
			count, _ = Trip.objects.all().delete()
			return Response({'detail': f'Deleted {count} trips.'}, status=status.HTTP_204_NO_CONTENT)
		except Exception as e:
			return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
