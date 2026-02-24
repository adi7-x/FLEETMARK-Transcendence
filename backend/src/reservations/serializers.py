from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())
    user_name = serializers.SerializerMethodField(read_only=True)
    user_role = serializers.SerializerMethodField(read_only=True)

    def get_user_name(self, obj):
        if obj.user is None:
            return None
        return obj.user.get_full_name().strip() or obj.user.username

    def get_user_role(self, obj):
        if obj.user is None:
            return None
        return obj.user.get_role_display()

    def validate(self, attrs):
        trip = attrs.get("trip")
        user = attrs.get("user")

        if self.instance is None and user is None:
            raise serializers.ValidationError(
                {"user": "This field is required for new reservations."}
            )

        if (
            self.instance is None
            and trip is not None
            and user is not None
            and Reservation.objects.filter(trip=trip, user=user).exists()
        ):
            raise serializers.ValidationError(
                {"user": "This user already has a reservation for this trip."}
            )

        return attrs

    class Meta:
        model = Reservation
        fields = ("id", "trip", "user", "user_name", "user_role", "created_at")
        read_only_fields = ("user_name", "user_role", "created_at")
