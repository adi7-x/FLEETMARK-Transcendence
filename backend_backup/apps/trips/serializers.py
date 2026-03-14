from rest_framework import serializers

from apps.trips.models import Trip


class TripSerializer(serializers.ModelSerializer):
	seats_left = serializers.IntegerField(read_only=True)

	class Meta:
		model = Trip
		fields = [
			'id',
			'route',
			'bus',
			'driver',
			'departure_datetime',
			'seats_left',
			'archived_at',
			'created_at',
		]
		read_only_fields = ['id', 'seats_left', 'archived_at', 'created_at']
