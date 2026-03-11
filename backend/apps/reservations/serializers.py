from rest_framework import serializers

from apps.reservations.models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Reservation
		fields = ['id', 'trip', 'student', 'created_at']
		read_only_fields = ['id', 'student', 'created_at']
