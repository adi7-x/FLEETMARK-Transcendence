import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssbs.settings')
django.setup()

from apps.users.models import User
from apps.stations.models import Station
from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route, RouteStation
from apps.trips.models import Trip

def seed():
    # Stations
    s1, _ = Station.objects.get_or_create(name='Main Campus')
    s2, _ = Station.objects.get_or_create(name='City Center')

    # Routes
    r1, _ = Route.objects.get_or_create(name='Main to Center', window='peak')
    RouteStation.objects.get_or_create(route=r1, station=s1, defaults={'order': 1})
    RouteStation.objects.get_or_create(route=r1, station=s2, defaults={'order': 2})

    # Bus
    b1, _ = Bus.objects.get_or_create(plate='TEST-BUS-01', defaults={'seat_capacity': 50, 'name': 'Integration Bus'})

    # Users
    u1, _ = User.objects.get_or_create(email='orgadmin@test.com', defaults={'role': 'LOGISTICS_STAFF', 'is_staff': True})
    u1.set_password('pass123')
    u1.save()

    u2, _ = User.objects.get_or_create(email='passenger@test.com', defaults={'role': 'STUDENT'})
    u2.set_password('pass123')
    u2.save()

    u3, _ = User.objects.get_or_create(email='driver@test.com', defaults={'role': 'DRIVER'})
    u3.set_password('pass123')
    u3.save()

    d1, _ = Driver.objects.get_or_create(username='driver@test.com', defaults={'name': 'Test Driver', 'password': 'pass'})

    # Trip
    from django.utils.timezone import now
    Trip.objects.get_or_create(route=r1, bus=b1, driver=d1, defaults={'departure_datetime': now()})

    print("DB Seeded.")

if __name__ == '__main__':
    seed()
