from rest_framework import serializers

from apps.reservations.models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
	trip_route = serializers.CharField(source='trip.route.name', read_only=True)
	trip_bus = serializers.CharField(source='trip.bus.name', read_only=True)
	trip_time = serializers.DateTimeField(source='trip.departure_datetime', read_only=True)
	trip_status = serializers.CharField(source='trip.status', read_only=True)

	class Meta:
		model = Reservation
		fields = ['id', 'trip', 'student', 'created_at', 'trip_route', 'trip_bus', 'trip_time', 'trip_status']
		read_only_fields = ['id', 'student', 'created_at']
