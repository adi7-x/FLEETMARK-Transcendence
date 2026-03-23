# SSBS Browser Testing Guide

**Project**: Smart School Bus System (SSBS)  
**Date**: March 11, 2026  
**Purpose**: Step-by-step browser testing instructions  
**Services**: Backend (Port 8000) + Frontend (Port 5173)

---

## 🌐 **Step 1: Open Your Browser and Test Backend API**

### Basic Setup Check
1. **Open your web browser** (Chrome, Firefox, Safari, etc.)
2. **Navigate to the backend API**: 
   ```
   http://localhost:8000/api/v1/auth/42/login/
   ```

3. **Expected Result**: You should see a JSON response like:
   ```json
   {
     "authorization_url": "https://api.intra.42.fr/oauth/authorize?client_id=..."
   }
   ```

### ✅ **If you see the JSON response**: Backend is working! Continue to Step 2.
### ❌ **If you get an error**: Check that Docker services are running with `docker-compose ps`

---

## 🎨 **Step 2: Check Frontend Application**

### Frontend Check
1. **Navigate to the frontend**:
   ```
   http://localhost:5173
   ```

2. **Expected Result**: You should see:
   - A React application (Vite development server)
   - Basic HTML page with Vite + React branding
   - Or a simple frontend interface

### ✅ **If frontend loads**: Great! You have both backend and frontend running.
### ❌ **If frontend doesn't load**: The frontend is currently a skeleton - this is expected.

---

## 🔧 **Step 3: Browser API Testing (No Code Required)**

Since browsers can't easily send custom headers for authentication, let's test the **public endpoints** first:

### Test 1: OAuth Login Endpoint
**URL**: `http://localhost:8000/api/v1/auth/42/login/`

**What to expect**:
```json
{
  "authorization_url": "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1e43a1208cc391dc9cd175b5b43b44170a366bcdc163bb2abb46bce53fa6c1bf&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fv1%2Fauth%2F42%2Fcallback%2F&response_type=code&scope=public"
}
```

### Test 2: Try Protected Endpoint (Should Fail)
**URL**: `http://localhost:8000/api/v1/stations/`

**What to expect**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

This is **correct behavior** - protected endpoints require authentication!

---

## 🛠️ **Step 4: Browser Testing with Developer Tools**

For testing authenticated endpoints in the browser, we'll use **Developer Tools**:

### Open Developer Console
1. **Right-click** on the browser page
2. **Select "Inspect"** or press `F12`
3. **Go to "Console" tab**

### Test with JavaScript fetch() in Console

Copy and paste this JavaScript code in the browser console:

```javascript
// Test 1: OAuth Login (Public)
fetch('http://localhost:8000/api/v1/auth/42/login/')
  .then(response => response.json())
  .then(data => console.log('OAuth Login:', data))
  .catch(error => console.error('Error:', error));
```

### Test Protected Endpoint (Will Fail - Expected)
```javascript
// Test 2: Protected Endpoint Without Auth
fetch('http://localhost:8000/api/v1/stations/')
  .then(response => response.json())
  .then(data => console.log('Stations (no auth):', data))
  .catch(error => console.error('Error:', error));
```

---

## 🔑 **Step 5: Browser Testing with Authentication Tokens**

Use the JWT tokens I generated earlier for authenticated testing:

### Student Token Test
```javascript
// Test 3: Stations with Student Token
const studentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczMjQzNTI4LCJpYXQiOjE3NzMyMzk5MjgsImp0aSI6IjdlOTMwZDE5NWUxZDQ3OThhMTdkNDQyY2M2ODgzOWRjIiwidXNlcl9pZCI6ImQ2Y2I1NzkyLWJiOGYtNGQxZS1iODc4LTUyZTU1NDM0MzRmZiJ9.YVopvDafEgO57RRGGGBDsGOiDqziw76FSjOXZ3DGQzY';

fetch('http://localhost:8000/api/v1/stations/', {
  headers: {
    'Authorization': `Bearer ${studentToken}`
  }
})
.then(response => response.json())
.then(data => console.log('Stations (student):', data))
.catch(error => console.error('Error:', error));
```

### Staff Token Test
```javascript
// Test 4: Buses with Staff Token (Staff Only)
const staffToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczMjQzNTI4LCJpYXQiOjE3NzMyMzk5MjgsImp0aSI6ImM0ZGYyMmVkYjY3MDQyZDBiMzYyM2E0MjEyYzdjZTM2IiwidXNlcl9pZCI6ImU0MmEwMDUwLTc1MTEtNDk3Mi04NDYzLTBiOWIxODA5YjA2MyJ9.xSQHVKqhEQZqhZ--M8TVlUERThVfhKIbRywbqaWl4pQ';

fetch('http://localhost:8000/api/v1/buses/', {
  headers: {
    'Authorization': `Bearer ${staffToken}`
  }
})
.then(response => response.json())
.then(data => console.log('Buses (staff only):', data))
.catch(error => console.error('Error:', error));
```

### Test User Profile
```javascript
// Test 5: Get User Profile
fetch('http://localhost:8000/api/v1/auth/me/', {
  headers: {
    'Authorization': `Bearer ${studentToken}`
  }
})
.then(response => response.json())
.then(data => console.log('User Profile:', data))
.catch(error => console.error('Error:', error));
```

---

## 📱 **Step 6: Browser-Based API Testing Tools**

### Option A: Use Browser Extensions

1. **Install a REST Client extension**:
   - **Chrome**: "Advanced REST client" or "Postman"
   - **Firefox**: "RESTClient" 
   - **General**: Any HTTP client extension

2. **Configure requests**:
   - URL: `http://localhost:8000/api/v1/stations/`
   - Method: `GET`
   - Header: `Authorization: Bearer YOUR_TOKEN_HERE`

### Option B: Use Online API Testing Tools

1. **Go to**: [httpie.io/app](https://httpie.io/app) or [reqbin.com](https://reqbin.com)
2. **Set up the request**:
   - URL: `http://localhost:8000/api/v1/stations/`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_TOKEN`
3. **Send the request**

---

## 🔄 **Step 7: Test CRUD Operations in Browser**

### Create a New Station (Staff Only)
```javascript
// Test 6: Create Station
fetch('http://localhost:8000/api/v1/stations/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${staffToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Browser Test Station'
  })
})
.then(response => response.json())
.then(data => console.log('Created Station:', data))
.catch(error => console.error('Error:', error));
```

### Try to Create Station as Student (Should Fail)
```javascript
// Test 7: Create Station as Student (Should Fail)
fetch('http://localhost:8000/api/v1/stations/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${studentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Student Station (Should Fail)'
  })
})
.then(response => response.json())
.then(data => console.log('Create as Student (should fail):', data))
.catch(error => console.error('Error:', error));
```

---

## 🧪 **Step 8: Test Business Logic in Browser**

### Create a Reservation
```javascript
// Test 8: Create Reservation
const tripId = '994c095d-7d7b-4df1-b99c-446ec8d414af'; // From our test data
const studentId = 'd6cb5792-bb8f-4d1e-b878-52e5543434ff';

fetch('http://localhost:8000/api/v1/reservations/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${studentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trip: tripId,
    user_id: studentId
  })
})
.then(response => response.json())
.then(data => console.log('Reservation:', data))
.catch(error => console.error('Error:', error));
```

### Check Your Reservations
```javascript
// Test 9: List My Reservations
fetch(`http://localhost:8000/api/v1/reservations/?user_id=${studentId}`, {
  headers: {
    'Authorization': `Bearer ${studentToken}`
  }
})
.then(response => response.json())
.then(data => console.log('My Reservations:', data))
.catch(error => console.error('Error:', error));
```

---

## 🎯 **Step 9: Visual Browser Testing Results**

### What You Should See:

1. **OAuth Login**: JSON with authorization URL
2. **Protected Endpoints**: "Authentication credentials were not provided" (when not authenticated)
3. **Stations List**: Array of station objects (when authenticated)  
4. **Permission Denied**: "You do not have permission" (student trying staff operations)
5. **Successful CRUD**: Created objects with IDs and timestamps
6. **Business Logic**: Reservations with proper validation

### Console Output Examples:
```javascript
// Success Response:
Stations (student): [
  {
    "id": "04a7a204-1caf-4fb9-8941-310d2717593c",
    "name": "Central Station",
    "created_at": "2026-03-11T14:38:37.921973Z"
  }
]

// Error Response:
Create as Student (should fail): {
  "detail": "You do not have permission to perform this action."
}
```

---

## 🚀 **Step 10: Advanced Browser Testing**

### Test Error Handling
```javascript
// Test 10: Test Domain Exceptions (Try to book same trip twice)
// First reservation should work, second should fail
fetch('http://localhost:8000/api/v1/reservations/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${studentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trip: tripId,
    user_id: studentId
  })
})
.then(response => response.json())
.then(data => console.log('Duplicate reservation attempt:', data))
.catch(error => console.error('Error:', error));
```

### Test Rate Limiting
```javascript
// Test 11: Multiple Rapid Requests (Test Rate Limiting)
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    fetch('http://localhost:8000/api/v1/auth/42/login/')
      .then(response => response.json())
      .then(data => console.log(`Request ${i + 1}:`, data.authorization_url ? 'OK' : 'ERROR'))
      .catch(error => console.error(`Request ${i + 1} Error:`, error));
  }, i * 100); // 100ms delay between requests
}
```

---

## ✅ **Browser Testing Checklist**

- [ ] **Backend API accessible** at `http://localhost:8000`
- [ ] **Frontend accessible** at `http://localhost:5173` 
- [ ] **OAuth endpoint returns** authorization URL
- [ ] **Protected endpoints** require authentication
- [ ] **Student token works** for allowed endpoints
- [ ] **Staff token works** for admin endpoints
- [ ] **Permission system** blocks unauthorized operations
- [ ] **CRUD operations** work correctly
- [ ] **Business logic** enforces reservations rules
- [ ] **Error handling** returns proper error messages
- [ ] **Rate limiting** prevents abuse
- [ ] **Domain exceptions** work correctly

---

## 🔧 **Troubleshooting Browser Issues**

### CORS Errors
If you see CORS errors:
```javascript
// Add this to see full error details:
fetch('http://localhost:8000/api/v1/stations/')
  .then(response => {
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    return response.json();
  })
  .catch(error => console.error('Full Error:', error));
```

### Token Expired
If you get "Token is invalid or expired":
```bash
# Regenerate tokens using the Django shell:
docker-compose exec backend python manage.py shell
# Then run the token generation code from the manual guide
```

### Network Issues
- Check Docker services: `docker-compose ps`
- Restart services: `docker-compose restart backend`
- Check logs: `docker-compose logs backend`

---

**Browser Testing Ready!** 🌐  
**Start with Step 1**: Open `http://localhost:8000/api/v1/auth/42/login/`