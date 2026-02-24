from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "trip", "created_at")
    search_fields = ("user__username", "user__first_name", "user__last_name", "user__email")
