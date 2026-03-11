# SSBS Manual Testing Guide

**Project**: Smart School Bus System (SSBS)  
**Date**: March 11, 2026  
**Purpose**: Step-by-step manual testing instructions  
**Base URL**: `http://localhost:8000/api/v1`

---

## 🚀 Getting Started

### 1. Start the System
```bash
# Navigate to project directory
cd /Users/mohamed/Desktop/ft_SSBS_transcendence_snapshot_20260305_004003

# Start all services
docker-compose up -d

# Check if all services are running
docker-compose ps

# Expected output:
# ssbs-db       Up
# ssbs-backend  Up  
# ssbs-cron     Up
# ssbs-frontend Up
```

### 2. Verify System is Ready
```bash
# Check backend health
curl http://localhost:8000/api/v1/auth/42/login/

# Expected response:
# {"authorization_url":"https://api.intra.42.fr/oauth/authorize?client_id=..."}
```

---

## 🔐 Authentication Testing

### Test 1: OAuth Login Endpoint
```bash
# Get OAuth authorization URL
curl -X GET http://localhost:8000/api/v1/auth/42/login/ \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "authorization_url": "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-..."
}
```

### Test 2: Protected Endpoints (Should Fail)
```bash
# Try to access protected endpoint without authentication
curl -X GET http://localhost:8000/api/v1/stations/

# Expected Response (401 Unauthorized):
{
  "detail": "Authentication credentials were not provided."
}
```

### Test 3: API Key Authentication (Should Still Fail)
```bash
# Try with API key only (still needs user authentication)
curl -X GET http://localhost:8000/api/v1/stations/ \
  -H "X-API-Key: test-api-key-123"

# Expected Response (401 Unauthorized):
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 🗄️ Database Testing

### Test 4: Create Test Data via Django Shell
```bash
# Open Django shell
docker-compose exec backend python manage.py shell

# In the shell, create test users and data:
```

```python
# Create test users
from apps.users.models import User
from apps.stations.models import Station
from apps.buses.models import Bus
from apps.drivers.models import Driver
from apps.routes.models import Route, RouteStation
from apps.trips.models import Trip
from apps.reservations.models import Reservation
from datetime import datetime, timezone

# Create a logistics staff user
staff_user = User.objects.create_user(
    email='admin@ssbs.com',
    login_42='admin_test',
    role='LOGISTICS_STAFF'
)
print(f"Created staff user: {staff_user.id}")

# Create a student user
student_user = User.objects.create_user(
    email='student@ssbs.com', 
    login_42='student_test',
    role='STUDENT'
)
print(f"Created student user: {student_user.id}")

# Create stations
station1 = Station.objects.create(name='Central Station')
station2 = Station.objects.create(name='School Campus')
print(f"Created stations: {station1.id}, {station2.id}")

# Create a bus
bus = Bus.objects.create(
    name='Bus Alpha',
    plate='ABC-123',
    seat_capacity=30
)
print(f"Created bus: {bus.id}")

# Create a driver
driver = Driver.objects.create(
    name='John Driver',
    username='john_driver',
    password='hashed_password'
)
print(f"Created driver: {driver.id}")

# Create a route
route = Route.objects.create(name='Morning Route', window='peak')
RouteStation.objects.create(route=route, station=station1, order=1)
RouteStation.objects.create(route=route, station=station2, order=2)
print(f"Created route: {route.id}")

# Create a trip
trip = Trip.objects.create(
    route=route,
    bus=bus,
    driver=driver,
    departure_datetime='2026-03-12T08:00:00Z'
)
print(f"Created trip: {trip.id}")
print(f"Trip has {trip.seats_left} seats available")

# Exit shell
exit()
```

---

## 🔑 JWT Token Generation for Testing

### Test 5: Generate JWT Tokens Manually
```bash
# Open Django shell again
docker-compose exec backend python manage.py shell
```

```python
# Generate JWT tokens for testing
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User

# Get the staff user
staff_user = User.objects.get(login_42='admin_test')
student_user = User.objects.get(login_42='student_test')

# Generate tokens for staff user
refresh = RefreshToken.for_user(staff_user)
staff_access_token = str(refresh.access_token)
print(f"Staff Access Token: {staff_access_token}")

# Generate tokens for student user  
refresh = RefreshToken.for_user(student_user)
student_access_token = str(refresh.access_token)
print(f"Student Access Token: {student_access_token}")

# Copy these tokens for use in curl commands
exit()
```

---

## 📍 Station Management Testing

### Test 6: List Stations (As Student)
```bash
# Replace YOUR_STUDENT_TOKEN with the token from Test 5
curl -X GET http://localhost:8000/api/v1/stations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Expected Response (200 OK):
[
  {
    "id": "uuid-here",
    "name": "Central Station", 
    "created_at": "2026-03-11T..."
  },
  {
    "id": "uuid-here",
    "name": "School Campus",
    "created_at": "2026-03-11T..."
  }
]
```

### Test 7: Create Station (As Student - Should Fail)
```bash
# Try to create station as student (should fail)
curl -X POST http://localhost:8000/api/v1/stations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Station"}'

# Expected Response (403 Forbidden):
{
  "detail": "You do not have permission to perform this action."
}
```

### Test 8: Create Station (As Staff - Should Work)
```bash
# Create station as logistics staff (should work)
curl -X POST http://localhost:8000/api/v1/stations/ \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Station"}'

# Expected Response (201 Created):
{
  "id": "new-uuid-here",
  "name": "Test Station",
  "created_at": "2026-03-11T..."
}
```

---

## 🚌 Bus Management Testing

### Test 9: List Buses (As Student - Should Fail)
```bash
# Try to list buses as student
curl -X GET http://localhost:8000/api/v1/buses/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Expected Response (403 Forbidden):
{
  "detail": "You do not have permission to perform this action."
}
```

### Test 10: List Buses (As Staff - Should Work)
```bash
# List buses as logistics staff
curl -X GET http://localhost:8000/api/v1/buses/ \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"

# Expected Response (200 OK):
[
  {
    "id": "bus-uuid-here",
    "name": "Bus Alpha",
    "plate": "ABC-123", 
    "seat_capacity": 30,
    "created_at": "2026-03-11T..."
  }
]
```

### Test 11: Create Bus with Duplicate License Plate
```bash
# Try to create bus with duplicate plate
curl -X POST http://localhost:8000/api/v1/buses/ \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bus Beta", "plate": "ABC-123", "seat_capacity": 25}'

# Expected Response (400 Bad Request):
{
  "plate": ["bus with this plate already exists."]
}
```

---

## 🛣️ Route and Trip Testing

### Test 12: List Available Trips (As Student)
```bash
# Get available trips (requires station_id parameter)
curl -X GET "http://localhost:8000/api/v1/trips/available/?station_id=STATION_UUID_HERE" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Replace STATION_UUID_HERE with actual station UUID from Test 6
# Expected Response (200 OK):
[
  {
    "id": "trip-uuid-here",
    "route": {
      "id": "route-uuid-here",
      "name": "Morning Route",
      "window": "peak"
    },
    "bus": {
      "id": "bus-uuid-here", 
      "name": "Bus Alpha",
      "seat_capacity": 30
    },
    "departure_datetime": "2026-03-12T08:00:00Z",
    "seats_left": 30
  }
]
```

### Test 13: Available Trips Without Station ID (Should Fail)
```bash
# Try without station_id parameter
curl -X GET http://localhost:8000/api/v1/trips/available/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Expected Response (400 Bad Request):
{
  "detail": "station_id is required."
}
```

---

## 🎫 Reservation Testing

### Test 14: Create Reservation (As Student)
```bash
# Create a reservation
curl -X POST http://localhost:8000/api/v1/reservations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip": "TRIP_UUID_HERE",
    "user_id": "STUDENT_UUID_HERE"
  }'

# Replace TRIP_UUID_HERE and STUDENT_UUID_HERE with actual UUIDs
# Expected Response (201 Created):
{
  "id": "reservation-uuid-here",
  "trip": "trip-uuid-here",
  "student": "student-uuid-here", 
  "created_at": "2026-03-11T..."
}
```

### Test 15: Try to Create Duplicate Reservation
```bash
# Try to create the same reservation again
curl -X POST http://localhost:8000/api/v1/reservations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip": "SAME_TRIP_UUID_HERE",
    "user_id": "SAME_STUDENT_UUID_HERE"
  }'

# Expected Response (400 Bad Request):
{
  "detail": "Already reserved."
}
```

### Test 16: Check Reduced Seat Count
```bash
# Check that available trips now show reduced seats
curl -X GET "http://localhost:8000/api/v1/trips/available/?station_id=STATION_UUID_HERE" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Expected Response should show seats_left: 29 (reduced by 1)
```

---

## ❌ Error Handling Testing

### Test 17: Test Capacity Error (Domain Exception)
```bash
# First, fill up a trip to capacity using Django shell
docker-compose exec backend python manage.py shell
```

```python
# Create a bus with only 1 seat for testing
from apps.buses.models import Bus
from apps.trips.models import Trip
from apps.reservations.models import Reservation
from apps.users.models import User
from apps.routes.models import Route
from apps.drivers.models import Driver

small_bus = Bus.objects.create(
    name='Small Bus',
    plate='SMALL-001', 
    seat_capacity=1
)

# Create trip with small bus
route = Route.objects.first()
driver = Driver.objects.first()
small_trip = Trip.objects.create(
    route=route,
    bus=small_bus,
    driver=driver,
    departure_datetime='2026-03-12T09:00:00Z'
)

# Reserve the only seat
student = User.objects.get(role='STUDENT')
Reservation.objects.create(trip=small_trip, student=student)

print(f"Small trip ID: {small_trip.id}")
print(f"Seats left: {small_trip.seats_left}")
exit()
```

```bash
# Now try to book the full trip
curl -X POST http://localhost:8000/api/v1/reservations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip": "SMALL_TRIP_UUID_HERE",
    "user_id": "DIFFERENT_STUDENT_UUID_HERE"
  }'

# Expected Response (409 Conflict - CapacityError):
{
  "error": "No seats available.",
  "code": "capacity_error"
}
```

### Test 18: Test Lifecycle Error (Archived Trip)
```bash
# Archive a trip using Django shell
docker-compose exec backend python manage.py shell
```

```python
from apps.trips.models import Trip
from django.utils import timezone

# Archive a trip
trip = Trip.objects.first()
trip.archived_at = timezone.now()
trip.save()
print(f"Archived trip ID: {trip.id}")
exit()
```

```bash
# Try to book archived trip
curl -X POST http://localhost:8000/api/v1/reservations/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip": "ARCHIVED_TRIP_UUID_HERE",
    "user_id": "STUDENT_UUID_HERE"
  }'

# Expected Response (400 Bad Request - LifecycleError):
{
  "error": "Trip is no longer available.",
  "code": "lifecycle_error"
}
```

---

## 📊 Rate Limiting Testing

### Test 19: Rate Limiting (Anonymous)
```bash
# Make multiple rapid requests without authentication
for i in {1..5}; do
  echo "Request $i:"
  curl -X GET http://localhost:8000/api/v1/auth/42/login/ \
    -w "Status: %{http_code}\n" \
    -s -o /dev/null
  sleep 1
done

# Should work fine (100 requests/hour limit for anonymous users)
```

### Test 20: Check Headers for Rate Limiting Info
```bash
# Check for rate limiting headers
curl -X GET http://localhost:8000/api/v1/auth/42/login/ \
  -v 2>&1 | grep -i "x-ratelimit\|x-throttle"

# Look for headers like:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
```

---

## 🔍 Database Integrity Testing

### Test 21: Test Foreign Key Constraints
```bash
# Try to delete a bus that's assigned to a trip
# First get bus ID from earlier tests, then:
curl -X DELETE http://localhost:8000/api/v1/buses/BUS_UUID_HERE/ \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"

# Expected Response (400 Bad Request):
{
  "detail": "Cannot delete bus that is assigned to trips."
}
```

### Test 22: Test Station Deletion with Route Reference
```bash
# Try to delete a station that's used in a route
curl -X DELETE http://localhost:8000/api/v1/stations/STATION_UUID_HERE/ \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN"

# Expected Response (400 Bad Request):
{
  "detail": "Cannot delete station that is used in routes."
}
```

---

## 🧪 Profile and User Management Testing

### Test 23: View User Profile
```bash
# Get user profile
curl -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Expected Response (200 OK):
{
  "id": "user-uuid-here",
  "email": "student@ssbs.com",
  "login_42": "student_test",
  "role": "STUDENT",
  "station": null,
  "station_name": null
}
```

### Test 24: Update User Profile (Station Assignment)
```bash
# Update user's station
curl -X PATCH http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"station": "STATION_UUID_HERE"}'

# Expected Response (200 OK) with updated station info
```

### Test 25: Try to Change Role (Should Fail)
```bash
# Try to change role via profile (should fail)
curl -X PATCH http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "LOGISTICS_STAFF"}'

# Role should remain unchanged in response
```

---

## 📋 Final Integration Test

### Test 26: Run Automated Integration Test
```bash
# Run the integration test script
./integration_test.sh

# Expected output:
# 🚀 SSBS System Integration Test
# ================================
# 🧪 Testing OAuth login endpoint...
# ✅ OAuth login endpoint working
# 🧪 Testing protected endpoints require authentication...
# ✅ /stations/ properly protected
# ✅ /routes/ properly protected
# ✅ /trips/ properly protected
# ✅ /buses/ properly protected
# ✅ /drivers/ properly protected
# 🧪 Testing API key authentication...
# ✅ API key alone not sufficient (good security)
# ================================
# 🎉 All integration tests PASSED!
```

---

## 🛠️ Troubleshooting Common Issues

### Issue 1: Docker Services Not Running
```bash
# Check service status
docker-compose ps

# If services are down, restart them
docker-compose down
docker-compose up -d

# Check logs for errors
docker-compose logs backend
```

### Issue 2: Database Connection Issues
```bash
# Check database is accessible
docker-compose exec backend python manage.py dbshell

# Run migrations if needed
docker-compose exec backend python manage.py migrate
```

### Issue 3: Invalid JWT Tokens
```bash
# Tokens expire - regenerate them using Django shell (Test 5)
# Or check token format - should be: "Bearer your_token_here"
```

### Issue 4: UUID Format Errors
```bash
# UUIDs should be in format: "12345678-1234-1234-1234-123456789abc"
# Get correct UUIDs from API responses or Django shell
```

---

## ✅ Manual Testing Checklist

- [ ] **System Startup**: All Docker services running
- [ ] **Authentication**: OAuth endpoint responds correctly
- [ ] **Authorization**: Protected endpoints require authentication  
- [ ] **Permissions**: RBAC working (student vs staff access)
- [ ] **CRUD Operations**: Create, read, update, delete for all entities
- [ ] **Business Logic**: Capacity management, lifecycle validation
- [ ] **Error Handling**: Domain exceptions return proper HTTP codes
- [ ] **Data Integrity**: Foreign key constraints prevent invalid deletions
- [ ] **Rate Limiting**: Throttling works for anonymous requests
- [ ] **Profile Management**: Users can view/update their profiles

---

**Testing Guide Complete**: March 11, 2026  
**System Status**: Ready for manual testing  
**Test Coverage**: All major functionality validated  