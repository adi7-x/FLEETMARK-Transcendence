# SSBS Real User Testing Plan - Clean Database Approach

**Project**: Smart School Bus System (SSBS)  
**Date**: March 11, 2026  
**Approach**: Clean database + Real 42 accounts + Chrome extension testing  
**Testing Strategy**: Logical CRUD order with fresh cache

---

## 🧹 **Phase 1: Database Reset and Clean Environment**

### 1.1 Clean Database Setup
```bash
# Stop all services
docker-compose down

# Remove database data (choose one method):
# Method A: Direct removal
rm -rf database/db_data

# Method B: Docker volume cleanup
docker-compose down -v
docker system prune -f

# Method C: Manual database reset
docker-compose up -d db
docker-compose exec db psql -U postgres -d ssbs -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### 1.2 Fresh Environment Start
```bash
# Start all services with clean database
docker-compose up -d

# Wait for services to be ready (30 seconds)
sleep 30

# Verify all services are running
docker-compose ps

# Apply fresh migrations
docker-compose exec backend python manage.py migrate

# Check database is clean
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
print('Total users:', User.objects.count())
"
```

---

## 👥 **Phase 2: Chrome Testing Setup**

### 2.1 Chrome Extension Setup
1. **Install REST Client Extension**:
   - Chrome Web Store → Search "Advanced REST client"
   - Or "Thunder Client" 
   - Or "Postman Interceptor"

2. **Chrome Windows Strategy**:
   - **Window 1**: Regular Chrome (Admin testing)
   - **Window 2**: Incognito Chrome (Student testing)
   - **Window 3**: Private Chrome with extension (API testing)

### 2.2 Test Environment Preparation
1. **Clear all Chrome cache/cookies**
2. **Open 3 Chrome windows as described**
3. **Prepare extension with base URLs**:
   - Backend API: `http://localhost:8000/api/v1/`
   - Frontend: `http://localhost:5173`

---

## 🎯 **Phase 3: Logical CRUD Testing Order**

### 3.1 Authentication Foundation (First Priority)
**Why first**: All other operations depend on authentication

#### Test 3.1.1: Admin OAuth Flow
**Chrome Window 1** (Regular):
```
1. Navigate to: http://localhost:8000/api/v1/auth/42/login/
2. Copy authorization_url from JSON response
3. Open URL in same window
4. Login with your ADMIN 42 account
5. Authorize the application
6. Note the callback URL and any tokens/codes
7. Save admin access token for later use
```

#### Test 3.1.2: Student OAuth Flow  
**Chrome Window 2** (Incognito):
```
1. Navigate to: http://localhost:8000/api/v1/auth/42/login/
2. Copy authorization_url from JSON response
3. Open URL in incognito window
4. Login with your STUDENT 42 account
5. Authorize the application
6. Note the callback URL and any tokens/codes
7. Save student access token for later use
```

#### Test 3.1.3: Verify User Creation
**Chrome Extension** (Window 3):
```
GET http://localhost:8000/api/v1/auth/me/
Headers: Authorization: Bearer ADMIN_TOKEN

GET http://localhost:8000/api/v1/auth/me/
Headers: Authorization: Bearer STUDENT_TOKEN
```

**Expected Results**:
- Admin user with LOGISTICS_STAFF role
- Student user with STUDENT role
- Different user IDs and 42 usernames

---

### 3.2 Core Entities Creation (Second Priority)
**Why second**: Foundation data needed for trips and reservations

#### Test 3.2.1: Stations (Admin Only)
**Chrome Extension**:
```
POST http://localhost:8000/api/v1/stations/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Campus Main Gate"
}

POST http://localhost:8000/api/v1/stations/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Downtown Terminal"
}

POST http://localhost:8000/api/v1/stations/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Airport Hub"
}
```

**Test Permission Denial**:
```
POST http://localhost:8000/api/v1/stations/
Headers: 
  Authorization: Bearer STUDENT_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Student Station (Should Fail)"
}
```

**Expected Results**:
- 3 stations created by admin
- Student POST request denied with 403 Forbidden

#### Test 3.2.2: Buses (Admin Only)
**Chrome Extension**:
```
POST http://localhost:8000/api/v1/buses/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "license_plate": "ABC-123",
  "capacity": 50,
  "model": "Mercedes Sprinter",
  "is_active": true
}

POST http://localhost:8000/api/v1/buses/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "license_plate": "XYZ-789",
  "capacity": 30,
  "model": "Ford Transit",
  "is_active": true
}
```

#### Test 3.2.3: Drivers (Admin Only)
**Chrome Extension**:
```
POST http://localhost:8000/api/v1/drivers/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Ahmed Al-Rashid",
  "phone": "+971501234567",
  "license_number": "DL-2024-001",
  "password": "SecurePass123!"
}

POST http://localhost:8000/api/v1/drivers/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Sara Al-Zahra",
  "phone": "+971507654321", 
  "license_number": "DL-2024-002",
  "password": "SecurePass456!"
}
```

---

### 3.3 Route Configuration (Third Priority)
**Why third**: Routes connect stations and are needed for trips

#### Test 3.3.1: Create Routes (Admin Only)
**Chrome Extension**:
```
POST http://localhost:8000/api/v1/routes/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Campus to Downtown Route",
  "stations": [
    "CAMPUS_MAIN_GATE_ID",
    "DOWNTOWN_TERMINAL_ID"
  ]
}

POST http://localhost:8000/api/v1/routes/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Full City Tour",
  "stations": [
    "CAMPUS_MAIN_GATE_ID",
    "DOWNTOWN_TERMINAL_ID",
    "AIRPORT_HUB_ID"
  ]
}
```

**Note**: Replace `STATION_ID` placeholders with actual UUIDs from station creation responses.

---

### 3.4 Trip Scheduling (Fourth Priority)
**Why fourth**: Trips are the core booking entity

#### Test 3.4.1: Create Trips (Admin Only)
**Chrome Extension**:
```
POST http://localhost:8000/api/v1/trips/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "route": "ROUTE_ID_1",
  "bus": "BUS_ID_1",
  "driver": "DRIVER_ID_1",
  "departure_time": "2026-03-12T08:00:00Z",
  "arrival_time": "2026-03-12T09:00:00Z",
  "price": 25.00
}

POST http://localhost:8000/api/v1/trips/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "route": "ROUTE_ID_2", 
  "bus": "BUS_ID_2",
  "driver": "DRIVER_ID_2",
  "departure_time": "2026-03-12T14:00:00Z",
  "arrival_time": "2026-03-12T16:30:00Z",
  "price": 45.00
}
```

#### Test 3.4.2: List Available Trips (Both Users)
**Chrome Extension**:
```
GET http://localhost:8000/api/v1/trips/
Headers: Authorization: Bearer ADMIN_TOKEN

GET http://localhost:8000/api/v1/trips/
Headers: Authorization: Bearer STUDENT_TOKEN
```

**Expected Results**:
- Both admin and student can see available trips
- Trips show seats_left based on bus capacity
- All trip details are visible

---

### 3.5 Reservation System (Fifth Priority - Core Business Logic)
**Why fifth**: This tests the main user interaction and business rules

#### Test 3.5.1: Student Makes Reservations
**Chrome Extension** (Student Token):
```
POST http://localhost:8000/api/v1/reservations/
Headers: 
  Authorization: Bearer STUDENT_TOKEN
  Content-Type: application/json
Body:
{
  "trip": "TRIP_ID_1",
  "user_id": "STUDENT_USER_ID"
}
```

#### Test 3.5.2: Verify Reservation Created
**Chrome Extension**:
```
GET http://localhost:8000/api/v1/reservations/?user_id=STUDENT_USER_ID
Headers: Authorization: Bearer STUDENT_TOKEN
```

#### Test 3.5.3: Test Business Logic - Duplicate Reservation
**Chrome Extension** (Should fail):
```
POST http://localhost:8000/api/v1/reservations/
Headers: 
  Authorization: Bearer STUDENT_TOKEN
  Content-Type: application/json
Body:
{
  "trip": "TRIP_ID_1",
  "user_id": "STUDENT_USER_ID"
}
```

**Expected Result**: Domain exception - "User already has a reservation for this trip"

#### Test 3.5.4: Admin Views All Reservations
**Chrome Extension**:
```
GET http://localhost:8000/api/v1/reservations/
Headers: Authorization: Bearer ADMIN_TOKEN
```

---

### 3.6 Advanced CRUD Operations (Sixth Priority)
**Why sixth**: Testing complete CRUD lifecycle

#### Test 3.6.1: Update Operations
**Chrome Extension**:
```
# Update Station Name (Admin)
PUT http://localhost:8000/api/v1/stations/STATION_ID/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Campus Main Gate - Updated"
}

# Update Bus Status (Admin)
PATCH http://localhost:8000/api/v1/buses/BUS_ID/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "is_active": false
}
```

#### Test 3.6.2: Delete Operations
**Chrome Extension**:
```
# Cancel Reservation (Student)
DELETE http://localhost:8000/api/v1/reservations/RESERVATION_ID/
Headers: Authorization: Bearer STUDENT_TOKEN

# Soft Delete Driver (Admin)
DELETE http://localhost:8000/api/v1/drivers/DRIVER_ID/
Headers: Authorization: Bearer ADMIN_TOKEN
```

---

### 3.7 Permission Testing (Seventh Priority)
**Why seventh**: Security validation across all entities

#### Test 3.7.1: Cross-Role Permission Tests
**Test Matrix**:
```
Student Token Tests (Should all fail with 403):
- POST/PUT/DELETE stations
- POST/PUT/DELETE buses  
- POST/PUT/DELETE drivers
- POST/PUT/DELETE routes
- POST/PUT/DELETE trips
- View other users' reservations

Admin Token Tests (Should all succeed):
- All CRUD operations on all entities
- View all reservations
- System administration
```

---

### 3.8 Error Handling and Edge Cases (Eighth Priority)
**Why eighth**: System resilience testing

#### Test 3.8.1: Validation Errors
**Chrome Extension**:
```
# Invalid data formats
POST http://localhost:8000/api/v1/buses/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "license_plate": "",
  "capacity": -5,
  "model": "x"
}

# Missing required fields
POST http://localhost:8000/api/v1/trips/
Headers: 
  Authorization: Bearer ADMIN_TOKEN
  Content-Type: application/json
Body:
{
  "route": "invalid-uuid"
}
```

#### Test 3.8.2: Capacity Testing
**Chrome Extension**:
```
# Create multiple reservations to test capacity limits
# (Repeat reservation creation until bus is full)
POST http://localhost:8000/api/v1/reservations/
Headers: 
  Authorization: Bearer STUDENT_TOKEN
  Content-Type: application/json
Body:
{
  "trip": "TRIP_ID",
  "user_id": "DIFFERENT_STUDENT_ID"
}
```

---

## 📊 **Phase 4: Testing Results Documentation**

### 4.1 Test Results Template
For each test, document:
```markdown
### Test X.X.X: [Test Name]
- **Status**: ✅ PASS / ❌ FAIL
- **Response Code**: [HTTP Status]
- **Response Time**: [Duration] 
- **Response Body**: [JSON/Error]
- **Notes**: [Any observations]
```

### 4.2 Chrome Windows Usage Log
```markdown
**Window 1 (Regular Chrome - Admin)**:
- OAuth login completed: ✅
- Admin token obtained: ✅
- Admin operations: [List results]

**Window 2 (Incognito - Student)**:
- OAuth login completed: ✅
- Student token obtained: ✅
- Student operations: [List results]

**Window 3 (Extension Testing)**:
- All API calls documented: ✅
- Permission tests completed: ✅
- Error scenarios tested: ✅
```

---

## ✅ **Testing Checklist - Complete CRUD Validation**

### Authentication ✅
- [ ] Admin 42 OAuth flow works
- [ ] Student 42 OAuth flow works  
- [ ] JWT tokens generated correctly
- [ ] User profiles created with correct roles

### Core Entities ✅
- [ ] Stations: CREATE, READ, UPDATE, DELETE
- [ ] Buses: CREATE, READ, UPDATE, DELETE
- [ ] Drivers: CREATE, READ, UPDATE, DELETE (soft delete)
- [ ] Routes: CREATE, READ, UPDATE, DELETE

### Business Logic ✅
- [ ] Trips: CREATE, READ, UPDATE, DELETE
- [ ] Reservations: CREATE, READ, DELETE
- [ ] Capacity management works
- [ ] Duplicate reservation prevention
- [ ] Business rule enforcement

### Permission System ✅
- [ ] Admin can access all endpoints
- [ ] Student can only access allowed endpoints
- [ ] 403 Forbidden returned for unauthorized access
- [ ] JWT token validation working

### Error Handling ✅
- [ ] Validation errors return proper messages
- [ ] Domain exceptions work correctly
- [ ] HTTP status codes are appropriate
- [ ] Rate limiting functions (if implemented)

### System Integration ✅
- [ ] Database relationships maintained
- [ ] Referential integrity enforced
- [ ] Cascade deletes work properly
- [ ] Migration compatibility

---

## 🚀 **Execution Commands**

### Quick Database Reset
```bash
# Complete reset
docker-compose down -v
docker-compose up -d
sleep 30
docker-compose exec backend python manage.py migrate
```

### Token Extraction Helper
```javascript
// Chrome Console - Extract token from OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
console.log('OAuth Code:', code);

// Convert to access token (use in extension)
fetch('http://localhost:8000/api/v1/auth/42/callback/?code=' + code)
  .then(response => response.json())
  .then(data => console.log('Access Token:', data));
```

---

**Ready for comprehensive real-user testing!** 🧪  
**Start with database reset, then follow the logical CRUD order for complete validation.**