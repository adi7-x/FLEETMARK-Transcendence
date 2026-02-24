from django.db import models
from django.conf import settings

from trips.models import Trip


class Reservation(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, related_name="reservations")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reservations",
        null=False,
        blank=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "user"],
                name="uniq_reservation_trip_user",
            )
        ]

    def __str__(self):
        full_name = self.user.get_full_name().strip() or self.user.username
        role_label = self.user.get_role_display()
        return f"{full_name} ({role_label}) -> Trip {self.trip.id}"
