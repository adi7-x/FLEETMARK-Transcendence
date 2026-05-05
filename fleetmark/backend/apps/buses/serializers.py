from rest_framework import serializers

from apps.buses.models import Bus


class BusSerializer(serializers.ModelSerializer):
	class Meta:
		model = Bus
		fields = ['id', 'name', 'plate', 'seat_capacity', 'created_at']
		read_only_fields = ['id', 'created_at']

	def validate_seat_capacity(self, value):
		if value <= 0:
			raise serializers.ValidationError("A bus must have at least 1 seat.")
		return value
