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


# ── Data (from data.txt) ─────────────────────────────────────────────────────
OCP_ROUTE_STOPS = [
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
]

COIN_BLUE_ROUTE_STOPS = [
    'Coin Bleu',
    'BMCE',
    'Café Al Mouhajir',
    'Café Al Akhawayne',
    'Posto Gosto',
    'Chaaibat',
    'Café Grind',
]

# Unified Night Route = all unique stops from both routes (Bus 1 order first)
UNIFIED_ROUTE_STOPS = list(dict.fromkeys(OCP_ROUTE_STOPS + COIN_BLUE_ROUTE_STOPS))

BUSES = [
    {'name': 'OCP Route Bus',           'plate': 'BUS-001', 'seat_capacity': 50},
    {'name': 'Coin Blue Route Bus',     'plate': 'BUS-002', 'seat_capacity': 50},
    {'name': 'Unified Night Route Bus', 'plate': 'BUS-003', 'seat_capacity': 50},
]

ROUTES = {
    'OCP Route':           {'window': 'peak',         'stops': OCP_ROUTE_STOPS},
    'Coin Blue Route':     {'window': 'peak',         'stops': COIN_BLUE_ROUTE_STOPS},
    'Unified Night Route': {'window': 'consolidated', 'stops': UNIFIED_ROUTE_STOPS},
}

DRIVERS = [
    {'name': 'Marouan', 'username': 'driver1', 'password': 'Marouan123'},
    {'name': 'Jawad', 'username': 'driver2', 'password': 'Jawad123'},
]

# Night-shift hours where trips are generated
TRIP_HOURS = [21, 22, 23, 0, 1, 3, 4, 5, 6]
PEAK_HOURS = {21, 22, 1}


class Command(BaseCommand):
    help = 'Seed the database with buses, stations, routes, drivers, and trips from data.txt.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('\n🚀 Starting seed_data …\n'))

        # ── 1. Create all unique stations ────────────────────────────────
        all_station_names = set(OCP_ROUTE_STOPS + COIN_BLUE_ROUTE_STOPS)
        created_stations = 0
        for name in sorted(all_station_names):
            _, created = Station.objects.get_or_create(name=name)
            if created:
                created_stations += 1
        self.stdout.write(f'✅ Stations: {created_stations} created, '
                          f'{len(all_station_names) - created_stations} already existed.')

        # ── 2. Create buses ──────────────────────────────────────────────
        created_buses = 0
        bus_map = {}
        for bus_data in BUSES:
            bus, created = Bus.objects.get_or_create(
                plate=bus_data['plate'],
                defaults={
                    'name': bus_data['name'],
                    'seat_capacity': bus_data['seat_capacity'],
                },
            )
            bus_map[bus_data['name']] = bus
            if created:
                created_buses += 1
        self.stdout.write(f'✅ Buses: {created_buses} created, '
                          f'{len(BUSES) - created_buses} already existed.')

        # ── 3. Create routes and link stations ───────────────────────────
        created_routes = 0
        route_map = {}
        for route_name, cfg in ROUTES.items():
            route, created = Route.objects.get_or_create(
                name=route_name,
                defaults={'window': cfg['window']},
            )
            route_map[route_name] = route
            if created:
                created_routes += 1

            # Link stations in order (skip if already linked)
            existing = route.route_stations.count()
            if existing == 0:
                for order, station_name in enumerate(cfg['stops'], start=1):
                    station = Station.objects.get(name=station_name)
                    RouteStation.objects.get_or_create(
                        route=route,
                        station=station,
                        defaults={'order': order},
                    )
                self.stdout.write(f'   🔗 {route_name}: linked {len(cfg["stops"])} stations.')
            else:
                self.stdout.write(f'   🔗 {route_name}: already has {existing} stations, skipped.')

        self.stdout.write(f'✅ Routes: {created_routes} created, '
                          f'{len(ROUTES) - created_routes} already existed.')

        # ── 4. Create drivers ────────────────────────────────────────────
        created_drivers = 0
        driver_list = []
        for drv in DRIVERS:
            driver, created = Driver.objects.get_or_create(
                username=drv['username'],
                defaults={
                    'name': drv['name'],
                    'password': drv['password'],
                    'status': 'active',
                },
            )
            driver_list.append(driver)
            if created:
                created_drivers += 1
        self.stdout.write(f'✅ Drivers: {created_drivers} created, '
                          f'{len(DRIVERS) - created_drivers} already existed.')

        # ── 5. Generate tonight's full schedule ──────────────────────────
        current = localtime(now())
        tonight = current.replace(hour=21, minute=0, second=0, microsecond=0)
        if current.hour >= 22:
            tonight += timedelta(days=1)

        default_driver = driver_list[0] if driver_list else None
        route_ocp     = route_map.get('OCP Route')
        route_cb      = route_map.get('Coin Blue Route')
        route_unified = route_map.get('Unified Night Route')
        bus_ocp       = bus_map.get('OCP Route Bus')
        bus_cb        = bus_map.get('Coin Blue Route Bus')
        bus_unified   = bus_map.get('Unified Night Route Bus')

        created_trips = 0
        for h in TRIP_HOURS:
            actual_date = tonight.date() if h >= 12 else tonight.date() + timedelta(days=1)
            departure = tonight.replace(
                year=actual_date.year, month=actual_date.month, day=actual_date.day,
                hour=h, minute=0, second=0, microsecond=0,
            )

            if h in PEAK_HOURS:
                # Peak hours → 2 trips: OCP Route + Coin Blue Route
                for route, bus in [(route_ocp, bus_ocp), (route_cb, bus_cb)]:
                    if not route or not bus:
                        continue
                    _, was_created = Trip.objects.get_or_create(
                        route=route,
                        departure_datetime=departure,
                        defaults={
                            'bus': bus,
                            'driver': default_driver,
                        },
                    )
                    if was_created:
                        created_trips += 1
                        self.stdout.write(f'   🚌 {route.name} @ {departure.strftime("%H:%M")}')
            else:
                # Normal hours → 1 trip: Unified Night Route
                if route_unified and bus_unified:
                    _, was_created = Trip.objects.get_or_create(
                        route=route_unified,
                        departure_datetime=departure,
                        defaults={
                            'bus': bus_unified,
                            'driver': default_driver,
                        },
                    )
                    if was_created:
                        created_trips += 1
                        self.stdout.write(f'   🚌 {route_unified.name} @ {departure.strftime("%H:%M")}')

        self.stdout.write(f'✅ Trips: {created_trips} created for tonight.')
        self.stdout.write(self.style.SUCCESS('\n🎉 Seed complete! The system is ready.\n'))
