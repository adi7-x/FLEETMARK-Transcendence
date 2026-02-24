from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def _cleanup_reservations(apps, schema_editor):
    Reservation = apps.get_model("reservations", "Reservation")

    # Drop legacy rows that were never linked to a real user.
    Reservation.objects.filter(user__isnull=True).delete()

    # Keep only one reservation per (trip, user), keeping the oldest by id.
    seen = set()
    to_delete = []
    for reservation in Reservation.objects.order_by("trip_id", "user_id", "id").iterator():
        key = (reservation.trip_id, reservation.user_id)
        if key in seen:
            to_delete.append(reservation.id)
            continue
        seen.add(key)

    if to_delete:
        Reservation.objects.filter(id__in=to_delete).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("reservations", "0003_reservation_user_phase1"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(_cleanup_reservations, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="reservation",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="reservations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RemoveField(
            model_name="reservation",
            name="passenger_name",
        ),
        migrations.AddConstraint(
            model_name="reservation",
            constraint=models.UniqueConstraint(
                fields=("trip", "user"),
                name="uniq_reservation_trip_user",
            ),
        ),
    ]
