# JWT Authentication Guide

## Overview
This project uses JWT (JSON Web Token) for authentication. Tokens are required to access all API endpoints.

## JWT Endpoints

### 1. Obtain Token (Login)
**POST** `/api/v1/accounts/token/`

Get access and refresh tokens by providing username and password.

**Request:**
```json
{
    "username": "your_username",
    "password": "your_password"
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Token Lifetimes:**
- Access Token: 1 hour
- Refresh Token: 7 days

---

### 2. Refresh Token
**POST** `/api/v1/accounts/token/refresh/`

Get a new access token using your refresh token.

**Request:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 3. Verify Token
**POST** `/api/v1/accounts/token/verify/`

Verify if a token is valid.

**Request:**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
- `200 OK` - Token is valid
- `401 Unauthorized` - Token is invalid or expired

---

## Using JWT Tokens

### In API Requests
Include the access token in the `Authorization` header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### cURL Example
```bash
# 1. Login to get token
curl -X POST http://127.0.0.1:8000/api/v1/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "pass123"}'

# 2. Use token to access protected endpoint
curl -X GET http://127.0.0.1:8000/api/v1/buses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Postman/Insomnia
1. Make a POST request to `/api/v1/accounts/token/` with username and password
2. Copy the `access` token from the response
3. In subsequent requests, add header:
   - Key: `Authorization`
   - Value: `Bearer <your_access_token>`

### Python Requests Example
```python
import requests

# Login
response = requests.post('http://127.0.0.1:8000/api/v1/accounts/token/', 
    json={
        'username': 'admin',
        'password': 'pass123'
    })
tokens = response.json()
access_token = tokens['access']

# Use token
headers = {'Authorization': f'Bearer {access_token}'}
buses = requests.get('http://127.0.0.1:8000/api/v1/buses/', headers=headers)
print(buses.json())
```

### JavaScript (Fetch API) Example
```javascript
// Login
const response = await fetch('http://127.0.0.1:8000/api/v1/accounts/token/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'admin',
        password: 'pass123'
    })
});
const { access } = await response.json();

// Use token
const busesResponse = await fetch('http://127.0.0.1:8000/api/v1/buses/', {
    headers: {
        'Authorization': `Bearer ${access}`
    }
});
const buses = await busesResponse.json();
console.log(buses);
```

---

## Token Expiration & Refresh

### Access Token Expired
When an access token expires (after 1 hour), you'll receive a `401 Unauthorized` response. Use your refresh token to get a new access token:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/accounts/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

### Refresh Token Expired
If your refresh token expires (after 7 days), you need to login again with username and password.

---

## User Roles & Permissions

The system has 4 user roles with different access levels:

### Superadmin (is_superuser=True)
- Full CRUD access to all resources
- Can manage all trips, routes, buses, and reservations
- Can start/end trips

### OrgAdmin (role='admin')
- Full CRUD access to all resources
- Can manage all trips, routes, buses, and reservations
- Can start/end trips

### Driver (role='driver')
- View all buses, routes, trips, reservations
- Can start and end trips
- Cannot create, update, or delete resources

### Passenger (role='passenger')
- View all buses, routes, trips, reservations
- Can create and delete reservations
- Cannot modify trips, routes, or buses

---

## Creating Test Users

```bash
# Create superuser
python manage.py createsuperuser

# Or use Django shell to create users with specific roles
python manage.py shell
```

```python
from accounts.models import User

# Create org admin
admin = User.objects.create_user(
    username='orgadmin',
    password='pass123',
    role='admin'
)

# Create driver
driver = User.objects.create_user(
    username='driver',
    password='pass123',
    role='driver'
)

# Create passenger
passenger = User.objects.create_user(
    username='passenger',
    password='pass123',
    role='passenger'
)
```

---

## Security Notes

1. **Never share your tokens** - Treat them like passwords
2. **HTTPS in production** - Always use HTTPS to prevent token interception
3. **Store tokens securely** - Don't store tokens in localStorage in production (use httpOnly cookies)
4. **Secret key** - Change `SECRET_KEY` in settings.py for production
5. **Token rotation** - Refresh tokens are rotated on use (new refresh token issued)

---

## Testing JWT Authentication

Run the JWT authentication tests:

```bash
python manage.py test accounts.test_jwt
```

Expected output:
```
Ran 9 tests in 7.717s
OK
```

---

## Troubleshooting

### "Authentication credentials were not provided"
- Make sure you included the `Authorization` header
- Check the token format: `Bearer <token>`

### "Token is invalid or expired"
- Use the refresh endpoint to get a new access token
- If refresh token is expired, login again

### "Given token not valid for any token type"
- The token format is incorrect
- Make sure you're using the access token (not refresh token) for API requests
- Token may be corrupted during copy/paste
