import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ssbs.settings")
sys.path.append("/home/adiLien/Desktop/fleet/fleetmark/backend")
django.setup()

from apps.reservations.models import Reservation
from apps.users.models import User
from django.utils import timezone
from datetime import timedelta

admin = User.objects.filter(role='LOGISTICS_STAFF').first()
student = User.objects.filter(role='STUDENT').first()

print(f"Admin: {admin.email if admin else 'None'}")
print(f"Student: {student.email if student else 'None'}")

if student:
    print(f"Reservations for student: {Reservation.objects.filter(student=student).count()}")

print("Backend Models loaded successfully.")
