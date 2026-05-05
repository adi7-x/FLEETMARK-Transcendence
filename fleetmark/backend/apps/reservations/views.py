from datetime import datetime, timedelta, time
from django.db import IntegrityError, transaction
from django.utils.timezone import get_current_timezone, localtime, make_aware
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import CapacityError, LifecycleError
from apps.reservations.models import Reservation
from apps.reservations.serializers import ReservationSerializer
from apps.trips.models import Trip

def get_bus_day_bounds(dt):
	local_dt = localtime(dt)
	if local_dt.hour < 6:
		shift_date = local_dt.date() - timedelta(days=1)
	else:
		shift_date = local_dt.date()
	
	start_unaware = datetime.combine(shift_date, time(hour=21))
	end_unaware = datetime.combine(shift_date + timedelta(days=1), time(hour=6))
	
	tz = get_current_timezone()
	return make_aware(start_unaware, tz), make_aware(end_unaware, tz)

class ReservationListCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
			reservations = Reservation.objects.filter(trip__archived_at__isnull=True)
		else:
			# Force filtering by the authenticated user's ID
			reservations = Reservation.objects.filter(
				student=request.user,
				trip__archived_at__isnull=True,
			)

		serializer = ReservationSerializer(reservations, many=True)
		return Response(serializer.data)

	def post(self, request):
		trip_id = request.data.get('trip')
		user_id = request.data.get('user_id')
		if not trip_id or not user_id:
			return Response(
				{'detail': 'trip and user_id are required.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		try:
			with transaction.atomic():
				trip = Trip.objects.select_for_update().select_related('bus').get(id=trip_id)

				if trip.archived_at is not None:
					raise LifecycleError('Trip is no longer available.')

				if trip.seats_left <= 0:
					raise CapacityError('No seats available.')

				start_dt, end_dt = get_bus_day_bounds(trip.departure_datetime)
				if Reservation.objects.filter(
					student_id=user_id,
					trip__departure_datetime__gte=start_dt,
					trip__departure_datetime__lte=end_dt
				).exists():
					return Response(
						{'detail': 'You already have a reservation for this day.'},
						status=status.HTTP_400_BAD_REQUEST,
					)

				try:
					reservation = Reservation.objects.create(trip=trip, student_id=user_id)
				except IntegrityError:
					return Response(
						{'detail': 'Already reserved.'},
						status=status.HTTP_400_BAD_REQUEST,
					)
		except Trip.DoesNotExist:
			return Response({'detail': 'Trip not found.'}, status=status.HTTP_404_NOT_FOUND)

		serializer = ReservationSerializer(reservation)
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReservationDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, pk):
		try:
			if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
				reservation = Reservation.objects.select_related('trip').get(id=pk)
			else:
				reservation = Reservation.objects.select_related('trip').get(id=pk, student=request.user)
		except Reservation.DoesNotExist:
			return Response(status=status.HTTP_404_NOT_FOUND)

		if reservation.trip.archived_at is not None:
			raise LifecycleError('Cannot cancel a reservation for an archived trip.')

		reservation.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class ReservationHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if getattr(request.user, 'role', None) == 'LOGISTICS_STAFF':
			reservations = Reservation.objects.filter(trip__archived_at__isnull=False)
		else:
			# Force filtering by the authenticated user's ID
			reservations = Reservation.objects.filter(
				student=request.user,
				trip__archived_at__isnull=False,
			)

		serializer = ReservationSerializer(reservations, many=True)
		return Response(serializer.data)

class ReservationSearchView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if getattr(request.user, 'role', None) != 'LOGISTICS_STAFF':
			return Response(status=status.HTTP_403_FORBIDDEN)
			
		qs = Reservation.objects.all().select_related('student', 'trip', 'trip__route', 'trip__bus')
		
		login = request.query_params.get('login')
		date_from = request.query_params.get('date_from')
		date_to = request.query_params.get('date_to')
		
		if login:
			qs = qs.filter(student__login_42__icontains=login)
			
		if date_from:
			try:
				dt_from = datetime.strptime(date_from, "%Y-%m-%d").date()
				qs = qs.filter(trip__departure_datetime__date__gte=dt_from)
			except ValueError:
				pass
				
		if date_to:
			try:
				dt_to = datetime.strptime(date_to, "%Y-%m-%d").date()
				qs = qs.filter(trip__departure_datetime__date__lte=dt_to)
			except ValueError:
				pass
				
		qs = qs.order_by('-trip__departure_datetime')
		serializer = ReservationSerializer(qs, many=True)
		return Response(serializer.data)
