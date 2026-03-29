from django.utils.timezone import localtime
from rest_framework import serializers

from apps.trips.models import Trip


class TripSerializer(serializers.ModelSerializer):
	seats_left = serializers.IntegerField(read_only=True)
	route_name = serializers.CharField(source='route.name', read_only=True)
	bus_name = serializers.CharField(source='bus.name', read_only=True)

	class Meta:
		model = Trip
		fields = [
			'id',
			'route',
			'route_name',
			'bus',
			'bus_name',
			'driver',
			'departure_datetime',
			'seats_left',
			'archived_at',
			'created_at',
		]
		read_only_fields = ['id', 'seats_left', 'archived_at', 'created_at', 'route_name', 'bus_name']

	def validate(self, data):
		if 'departure_datetime' in data:
			dt = data['departure_datetime']
			hr = localtime(dt).hour
			if hr not in [21, 22, 23, 0, 1, 3, 4, 5, 6]:
				raise serializers.ValidationError("Bus system only works between 21:00 and 06:00, with 02:00 break disabled.")
			
			route = data.get('route')
			if route:
				qs = Trip.objects.filter(departure_datetime=dt, route=route)
				if self.instance:
					qs = qs.exclude(id=self.instance.id)
				if qs.exists():
					raise serializers.ValidationError("A trip for this route and time already exists.")
		
		return data
