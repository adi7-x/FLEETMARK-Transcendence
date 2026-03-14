"""Seed the database with 1337-specific data: routes, stops, buses, and schedules."""
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
from apps.schedules.models import ScheduleConfig, StoppedPeriod

def seed_1337():
    print("🏫 Seeding 1337 school data...")

    # ── Stations (real 1337 Khouribga stops) ──
    stops = [
        'Campus 1337',
        'Hay El Qods',
        'Quartier Administratif',
        'Gare Routière Khouribga',
        'OCP Club',
        'Hay Ennasr',
        'Centre Ville',
    ]
    stations = {}
    for name in stops:
        s, _ = Station.objects.get_or_create(name=name)
        stations[name] = s
    print(f"  ✅ {len(stations)} stations created")

    # ── Routes ──
    route_defs = [
        ('Campus → Centre Ville', 'peak', ['Campus 1337', 'Hay El Qods', 'Quartier Administratif', 'Centre Ville']),
        ('Campus → Gare Routière', 'peak', ['Campus 1337', 'Hay Ennasr', 'Gare Routière Khouribga']),
        ('Centre Ville → Campus', 'consolidated', ['Centre Ville', 'Quartier Administratif', 'Hay El Qods', 'Campus 1337']),
        ('Gare Routière → Campus', 'consolidated', ['Gare Routière Khouribga', 'Hay Ennasr', 'Campus 1337']),
        ('Campus → OCP Club', 'peak', ['Campus 1337', 'Hay El Qods', 'OCP Club']),
    ]
    routes = {}
    for rname, window, stop_names in route_defs:
        r, _ = Route.objects.get_or_create(name=rname, defaults={'window': window})
        for i, sname in enumerate(stop_names, 1):
            RouteStation.objects.get_or_create(route=r, station=stations[sname], defaults={'order': i})
        routes[rname] = r
    print(f"  ✅ {len(routes)} routes created")

    # ── Buses ──
    bus_defs = [
        ('1337-BUS-01', '1337 Express A', 50),
        ('1337-BUS-02', '1337 Express B', 50),
        ('1337-BUS-03', '1337 Shuttle C', 30),
    ]
    buses = {}
    for plate, name, cap in bus_defs:
        b, _ = Bus.objects.get_or_create(plate=plate, defaults={'name': name, 'seat_capacity': cap})
        buses[plate] = b
    print(f"  ✅ {len(buses)} buses created")

    # ── Users ──
    u1, _ = User.objects.get_or_create(email='orgadmin@test.com', defaults={'role': 'LOGISTICS_STAFF', 'is_staff': True})
    u1.set_password('pass123')
    u1.save()

    u2, _ = User.objects.get_or_create(email='passenger@test.com', defaults={'role': 'STUDENT'})
    u2.set_password('pass123')
    u2.save()

    u3, _ = User.objects.get_or_create(email='driver@test.com', defaults={'role': 'DRIVER'})
    u3.set_password('pass123')
    u3.save()
    print("  ✅ 3 test users created")

    # ── Drivers ──
    d1, _ = Driver.objects.get_or_create(username='driver@test.com', defaults={'name': 'Test Driver', 'password': 'pass'})
    d2, _ = Driver.objects.get_or_create(username='driver2@test.com', defaults={'name': 'Youssef B.', 'password': 'pass'})
    print("  ✅ 2 drivers created")

    # ── Trips ──
    from django.utils.timezone import now
    from datetime import timedelta
    base = now()
    trip_defs = [
        (routes['Campus → Centre Ville'], buses['1337-BUS-01'], d1, base),
        (routes['Campus → Gare Routière'], buses['1337-BUS-02'], d2, base + timedelta(hours=1)),
        (routes['Centre Ville → Campus'], buses['1337-BUS-03'], d1, base + timedelta(hours=2)),
    ]
    for route, bus, driver, departure in trip_defs:
        Trip.objects.get_or_create(
            route=route, bus=bus, driver=driver,
            defaults={'departure_datetime': departure}
        )
    print(f"  ✅ {len(trip_defs)} trips created")

    # ── Schedule Config ──
    if not ScheduleConfig.objects.exists():
        config = ScheduleConfig.objects.create(
            organization_name='1337 School',
            start_time='22:00',
            end_time='06:00',
            overnight=True,
            active_days=[True, True, True, True, True, False, False],
            frequency_minutes=60,
            buses=[
                {'name': '1337 Express A', 'capacity': 50},
                {'name': '1337 Express B', 'capacity': 50},
                {'name': '1337 Shuttle C', 'capacity': 30},
            ],
        )
        StoppedPeriod.objects.create(schedule=config, start_time='02:00', end_time='03:00', reason='Low demand break')
        print("  ✅ Schedule config created")

    print("\n🎉 1337 school data seeded successfully!")

if __name__ == '__main__':
    seed_1337()
