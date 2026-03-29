import os
import django
import sys
import datetime

sys.path.append("/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ssbs.settings")
django.setup()

from django.test.client import APIClient
from apps.users.models import User
from apps.trips.models import Trip
from apps.reservations.models import Reservation

print("Starting tests...")
client = APIClient()

admin = User.objects.filter(role='LOGISTICS_STAFF').first()
student = User.objects.filter(role='STUDENT').first()

# TEST BULK DELETE
print(f"1. Deleting trips. Start count: {Trip.objects.count()}")
client.force_authenticate(user=admin)
res = client.delete('/api/v1/trips/bulk-delete/')
assert res.status_code == 204
print(f"Bulk Delete OK! Remaining trips: {Trip.objects.count()}")

# TEST BULK GENERATE
today = datetime.date.today().strftime('%Y-%m-%d')
tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
res = client.post('/api/v1/trips/bulk-generate/', {
    'type': 'regular',
    'start_date': today,
    'end_date': tomorrow,
    'skip_weekends': False
}, format='json')
assert res.status_code == 201
print(f"Bulk Generate OK! Created {Trip.objects.count()} trips.")

# TEST STUDENT BOOKING LOGIC
print("2. Testing Student bounds...")
client.force_authenticate(user=student)
active_trip = Trip.objects.first()
if active_trip:
    res1 = client.post('/api/v1/reservations/', {'trip_id': active_trip.id}, format='json')
    print("First booking status:", res1.status_code)
    res2 = client.post('/api/v1/reservations/', {'trip_id': active_trip.id}, format='json')
    print("Second booking status:", res2.status_code)
    if res2.status_code == 400:
        print("Student Booking Bound OK!")
    else:
        print("WARNING: Student could book twice!")

# TEST STUDENT REPORT
print("3. Testing Reports...")
if active_trip:
    res_report = client.post('/api/v1/reports/', {
        'trip': active_trip.id,
        'category': 'late',
        'description': 'Test report.'
    }, format='json')
    print("Report POST OK:", res_report.status_code == 201)

# TEST ADMIN SEARCH
print("4. Testing Admin Search...")
client.force_authenticate(user=admin)
res_search = client.get(f'/api/v1/reservations/search/?login={student.login_42 or "jdoe"}')
print(f"Search Returns {len(res_search.data)} reservations.")

print("Tests finished!")
