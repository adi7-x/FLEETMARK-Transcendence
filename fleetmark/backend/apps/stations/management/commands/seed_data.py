"""
Management command to seed buses, stations, routes, route-stations,
drivers, and tonight's trips so students can use the platform.
Usage:  python manage.py seed_data
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils.timezone import localtime, now

from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route, RouteStation
from apps.stations.models import Station
from apps.trips.models import Trip


# ── Data ─────────────────────────────────────────────────────────────────────
BUSES = [
    {'name': 'Bus 1', 'plate': 'BUS-001', 'seat_capacity': 50},
    {'name': 'Bus 2', 'plate': 'BUS-002', 'seat_capacity': 50},
]

BUS_ROUTES = {
    'Bus 1': [
        'OCP Saka',
        'OCP 6',
        'Nakhil',
        'Chaaibat (Lhayat Pharmacy)',
        'Posto Gosto',
        'Mesk Lil',
        'Jnane Lkhir',
        'Lhamriti (Ben Salem)',
        'Al Fadl',
        'Kentra Jnane Lkhir',
        'Pharmacie Ibn Sina',
        'Al Qods',
        'Sissane',
        'La Gare',
        'Dyour Chouhada',
        'Chtayba',
        'Ibn Tofail',
        'Green Oil Station',
    ],
    'Bus 2': [
        'Coin Bleu',
        'BMCE',
        'Café Al Mouhajir',
        'Café Al Akhawayne',
        'Posto Gosto',
        'Chaaibat',
        'Café Grind',
    ],
}

DRIVERS = [
    {'name': 'Driver 1', 'username': 'driver1', 'password': 'driver123'},
    {'name': 'Driver 2', 'username': 'driver2', 'password': 'driver123'},
]


class Command(BaseCommand):
    help = 'Seed the database with buses, stations, routes, drivers, and trips.'

    def handle(self, *args, **options):
        # ── 1. Create all unique stations ────────────────────────────────
        all_station_names = set()
        for stops in BUS_ROUTES.values():
            all_station_names.update(stops)

        created_stations = 0
        for name in sorted(all_station_names):
            _, created = Station.objects.get_or_create(name=name)
            if created:
                created_stations += 1
        self.stdout.write(f'✅ Stations: {created_stations} created, '
                          f'{len(all_station_names) - created_stations} already existed.')

        # ── 2. Create buses ──────────────────────────────────────────────
        created_buses = 0
        bus_objects = {}
        for bus_data in BUSES:
            bus, created = Bus.objects.get_or_create(
                name=bus_data['name'],
                defaults={
                    'plate': bus_data['plate'],
                    'seat_capacity': bus_data['seat_capacity'],
                },
            )
            bus_objects[bus_data['name']] = bus
            if created:
                created_buses += 1
        self.stdout.write(f'✅ Buses: {created_buses} created, '
                          f'{len(BUSES) - created_buses} already existed.')

        # ── 3. Create routes and link stations ───────────────────────────
        created_routes = 0
        route_objects = {}
        for bus_name, stops in BUS_ROUTES.items():
            route_name = f'{bus_name} Route'
            route, created = Route.objects.get_or_create(
                name=route_name,
                defaults={'window': 'peak'},
            )
            route_objects[bus_name] = route
            if created:
                created_routes += 1

            # link stations in order (skip if already linked)
            existing = route.route_stations.count()
            if existing == 0:
                for order, station_name in enumerate(stops, start=1):
                    station = Station.objects.get(name=station_name)
                    RouteStation.objects.get_or_create(
                        route=route,
                        station=station,
                        defaults={'order': order},
                    )
                self.stdout.write(f'   🔗 {route_name}: linked {len(stops)} stations.')
            else:
                self.stdout.write(f'   🔗 {route_name}: already has {existing} stations, skipped.')

        self.stdout.write(f'✅ Routes: {created_routes} created, '
                          f'{len(BUS_ROUTES) - created_routes} already existed.')

        # ── 4. Create drivers ────────────────────────────────────────────
        created_drivers = 0
        driver_objects = {}
        for i, drv in enumerate(DRIVERS):
            driver, created = Driver.objects.get_or_create(
                username=drv['username'],
                defaults={
                    'name': drv['name'],
                    'password': drv['password'],
                    'status': 'active',
                },
            )
            driver_objects[i] = driver
            if created:
                created_drivers += 1
        self.stdout.write(f'✅ Drivers: {created_drivers} created, '
                          f'{len(DRIVERS) - created_drivers} already existed.')

        # ── 5. Create tonight's trips ────────────────────────────────────
        # Schedule trips for tonight at 21:00 and 22:00 (or next window)
        current = localtime(now())
        # Set tonight at 21:00
        tonight = current.replace(hour=21, minute=0, second=0, microsecond=0)
        # If it's already past 21:00, push to tomorrow
        if current.hour >= 22:
            tonight += timedelta(days=1)

        created_trips = 0
        trip_configs = [
            {'bus': 'Bus 1', 'driver_idx': 0, 'offset_hours': 0},   # 21:00
            {'bus': 'Bus 2', 'driver_idx': 1, 'offset_hours': 1},   # 22:00
        ]
        for cfg in trip_configs:
            bus = bus_objects[cfg['bus']]
            route = route_objects[cfg['bus']]
            driver = driver_objects[cfg['driver_idx']]
            departure = tonight + timedelta(hours=cfg['offset_hours'])

            # Avoid duplicates: check if a trip with same route+bus exists today
            existing_trip = Trip.objects.filter(
                route=route,
                bus=bus,
                departure_datetime__date=departure.date(),
                archived_at__isnull=True,
            ).first()

            if not existing_trip:
                Trip.objects.create(
                    route=route,
                    bus=bus,
                    driver=driver,
                    departure_datetime=departure,
                )
                created_trips += 1
                self.stdout.write(f'   🚌 Trip: {route.name} with {bus.name} at {departure.strftime("%H:%M")}')
            else:
                self.stdout.write(f'   🚌 Trip for {route.name} already exists today, skipped.')

        self.stdout.write(f'✅ Trips: {created_trips} created.')
        self.stdout.write(self.style.SUCCESS('🎉 Seed complete!'))
