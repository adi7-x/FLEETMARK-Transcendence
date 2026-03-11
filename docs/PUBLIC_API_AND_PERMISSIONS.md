# Public API & Advanced Permissions — SSBS

---

## 1. Public API (Major Module — 2 points)

### What is it?

A **Public API** is a set of endpoints that external applications (mobile apps, scripts,
partner systems) can use to interact with your database. It is **secured** so that only
authorized applications can access it, and **rate-limited** so that no one can overload
your server.

### What was implemented

#### 1.1 API Key Authentication

Every request to the API must include a secret key in the `X-API-Key` HTTP header.
Without it, the server responds with `403 Forbidden`.

**File:** `backend/apps/users/permissions.py`

```python
class HasAPIKey(BasePermission):
    def has_permission(self, request, view):
        api_key = request.headers.get('X-API-Key', '')
        expected_key = os.environ.get('SSBS_API_KEY', '')
        return api_key and expected_key and api_key == expected_key
```

**How it works:**

```
# Without API key → blocked
curl http://localhost:8000/api/v1/stations/
→ 403 Forbidden

# With valid API key → allowed
curl -H "X-API-Key: my-secret-key" http://localhost:8000/api/v1/stations/
→ 200 OK
```

The secret key is stored in the `.env` file as `SSBS_API_KEY` and is never committed
to Git.

#### 1.2 Rate Limiting

Limits how many requests a client can make per hour to prevent abuse and server
overload.

**File:** `backend/ssbs/settings.py`

```python
REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',     # unauthenticated users: 100 requests/hour
        'user': '1000/hour',    # authenticated users: 1000 requests/hour
    },
}
```

**How it works:**

```
# A bot sends 101 requests in 1 hour (unauthenticated)
Request #1-100  → 200 OK
Request #101    → 429 Too Many Requests
```

#### 1.3 Documentation

All endpoints are documented in `docs/BACKEND_API.md` with:
- HTTP method and URL
- Request/response examples
- Authentication requirements

#### 1.4 Endpoints (13+ endpoints, well above the required 5)

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/v1/stations/`               | List all stations                    |
| POST   | `/api/v1/stations/`               | Create a station                     |
| GET    | `/api/v1/stations/<id>/`          | Get a station                        |
| PUT    | `/api/v1/stations/<id>/`          | Update a station                     |
| DELETE | `/api/v1/stations/<id>/`          | Delete a station                     |
| GET    | `/api/v1/buses/`                  | List all buses                       |
| POST   | `/api/v1/buses/`                  | Create a bus                         |
| GET    | `/api/v1/buses/<id>/`             | Get a bus                            |
| PUT    | `/api/v1/buses/<id>/`             | Update a bus                         |
| DELETE | `/api/v1/buses/<id>/`             | Delete a bus                         |
| GET    | `/api/v1/drivers/`                | List all drivers                     |
| POST   | `/api/v1/drivers/`                | Create a driver                      |
| GET    | `/api/v1/drivers/<id>/`           | Get a driver                         |
| PUT    | `/api/v1/drivers/<id>/`           | Update a driver                      |
| DELETE | `/api/v1/drivers/<id>/`           | Delete a driver                      |
| GET    | `/api/v1/routes/`                 | List all routes                      |
| POST   | `/api/v1/routes/`                 | Create a route                       |
| GET    | `/api/v1/routes/<id>/`            | Get a route                          |
| PUT    | `/api/v1/routes/<id>/`            | Update a route                       |
| DELETE | `/api/v1/routes/<id>/`            | Delete a route                       |
| GET    | `/api/v1/trips/`                  | List all trips                       |
| POST   | `/api/v1/trips/`                  | Create a trip                        |
| GET    | `/api/v1/trips/<id>/`             | Get a trip                           |
| PUT    | `/api/v1/trips/<id>/`             | Update a trip                        |
| DELETE | `/api/v1/trips/<id>/`             | Delete a trip                        |
| GET    | `/api/v1/trips/available/`        | List available trips for a station   |
| GET    | `/api/v1/reservations/`           | List user reservations               |
| POST   | `/api/v1/reservations/`           | Create a reservation                 |
| DELETE | `/api/v1/reservations/<id>/`      | Cancel a reservation                 |
| GET    | `/api/v1/reservations/history/`   | Reservation history                  |
| GET    | `/api/v1/auth/users/`             | List all users                       |
| GET    | `/api/v1/auth/users/<id>/`        | Get a user                           |
| PATCH  | `/api/v1/auth/users/<id>/`        | Edit a user                          |
| DELETE | `/api/v1/auth/users/<id>/`        | Delete a user                        |

---

## 2. Advanced Permissions System (Major Module — 2 points)

### What is it?

A **role-based access control (RBAC)** system that restricts what each user can do
based on their role. Different users see different things and can perform different
actions.

### What was implemented

#### 2.1 Three Roles

Defined in `backend/apps/users/models.py`:

| Role                | Who          | What they can do                                              |
|---------------------|--------------|---------------------------------------------------------------|
| `LOGISTICS_STAFF`   | School admin | Manage buses, stations, drivers, routes, trips, users         |
| `STUDENT`           | Student      | Browse available trips, make/cancel reservations, view profile|
| `DRIVER`            | Bus driver   | View assigned trips                                           |

#### 2.2 Permission Classes

Defined in `backend/apps/users/permissions.py`:

| Class                         | What it checks                                               |
|-------------------------------|--------------------------------------------------------------|
| `HasAPIKey`                   | Is the `X-API-Key` header valid?                             |
| `IsLogisticsStaff`            | Is the user logged in AND has role `LOGISTICS_STAFF`?        |
| `IsStudent`                   | Is the user logged in AND has role `STUDENT`?                |
| `IsDriver`                    | Is the user logged in AND has role `DRIVER`?                 |
| `IsLogisticsStaffOrReadOnly`  | Staff can do anything; others can only read (GET)            |

#### 2.3 Permission Matrix — Who Can Access What

| Endpoint                              | Permission         | LOGISTICS_STAFF | STUDENT | DRIVER | Anonymous |
|---------------------------------------|-------------------|:---------------:|:-------:|:------:|:---------:|
| `POST /auth/42/login/`                | AllowAny          | ✅              | ✅      | ✅     | ✅        |
| `GET /auth/42/callback/`              | AllowAny          | ✅              | ✅      | ✅     | ✅        |
| `POST /auth/token/refresh/`           | AllowAny          | ✅              | ✅      | ✅     | ✅        |
| `GET/PATCH /auth/me/`                 | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `GET /auth/users/`                    | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/PATCH/DELETE /auth/users/<id>/`  | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET /stations/`                      | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `POST /stations/`                     | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET /stations/<id>/`                 | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `PUT/DELETE /stations/<id>/`          | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/POST /buses/`                    | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/PUT/DELETE /buses/<id>/`         | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/POST /drivers/`                  | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/PUT/DELETE /drivers/<id>/`       | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/POST /routes/`                   | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/PUT/DELETE /routes/<id>/`        | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/POST /trips/`                    | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET/PUT/DELETE /trips/<id>/`         | IsLogisticsStaff  | ✅              | ❌      | ❌     | ❌        |
| `GET /trips/available/`               | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `GET/POST /reservations/`             | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `DELETE /reservations/<id>/`          | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |
| `GET /reservations/history/`          | IsAuthenticated   | ✅              | ✅      | ✅     | ❌        |



#### 2.4 User CRUD (Logistics Staff Only)

**New endpoints** for managing users:

| Method | Endpoint                       | Action                                  |
|--------|--------------------------------|-----------------------------------------|
| GET    | `/api/v1/auth/users/`          | List all users                          |
| GET    | `/api/v1/auth/users/<id>/`     | View a specific user                    |
| PATCH  | `/api/v1/auth/users/<id>/`     | Edit user (role, station, is_active)    |
| DELETE | `/api/v1/auth/users/<id>/`     | Delete a user                           |

**Files:**
- `backend/apps/users/views.py` — `UserListView`, `UserDetailView`
- `backend/apps/users/serializers.py` — `UserAdminSerializer` (allows staff to edit role, station, is_active)
- `backend/apps/users/urls.py` — new URL patterns

#### 2.5 How the Flow Works

```
Student logs in via 42 OAuth
    → Gets JWT token with role=STUDENT
    → Tries GET /api/v1/buses/
    → IsLogisticsStaff checks: role == LOGISTICS_STAFF? NO
    → 403 Forbidden

    → Tries GET /api/v1/trips/available/?station_id=xxx
    → IsAuthenticated checks: is logged in? YES
    → 200 OK — sees available trips

Staff logs in via 42 OAuth
    → Gets JWT token with role=LOGISTICS_STAFF
    → Tries GET /api/v1/buses/
    → IsLogisticsStaff checks: role == LOGISTICS_STAFF? YES
    → 200 OK — sees all buses

    → Tries DELETE /api/v1/auth/users/<student-id>/
    → IsLogisticsStaff checks: role == LOGISTICS_STAFF? YES
    → 204 No Content — user deleted
```

---

## 3. Files Changed

| File                                    | Changes                                                      |
|-----------------------------------------|--------------------------------------------------------------|
| `backend/apps/users/permissions.py`     | Added `HasAPIKey`, `IsLogisticsStaffOrReadOnly`              |
| `backend/ssbs/settings.py`              | Added throttle config, `SSBS_API_KEY` env var                |
| `backend/apps/users/serializers.py`     | Added `UserAdminSerializer`                                  |
| `backend/apps/users/views.py`           | Added `UserListView`, `UserDetailView`                       |
| `backend/apps/users/urls.py`            | Added `users/`, `users/<uuid:pk>/`                           |
| `backend/apps/buses/views.py`           | `AllowAny` → `IsLogisticsStaff`                              |
| `backend/apps/stations/views.py`        | GET → `IsAuthenticated`, POST/PUT/DELETE → `IsLogisticsStaff`|
| `backend/apps/drivers/views.py`         | `AllowAny` → `IsLogisticsStaff`                              |
| `backend/apps/routes/views.py`          | `AllowAny` → `IsLogisticsStaff`                              |
| `backend/apps/trips/views.py`           | `AllowAny` → `IsLogisticsStaff` / `IsAuthenticated`          |
| `backend/apps/reservations/views.py`    | `AllowAny` → `IsAuthenticated`                               |
| `.env.example`                          | Added `SSBS_API_KEY`                                         |

---

## 4. Environment Variable

Add to your `.env` file:

```bash
SSBS_API_KEY=your-secret-api-key-here
```

#### How to generate a secure key

Run this command in your terminal:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**What it does:**
- `secrets` is Python's built-in module for generating cryptographically secure random values
- `token_urlsafe(32)` generates a random 43-character string using letters, numbers, `-`, and `_`
- The output is impossible to guess or brute-force

**Example:**

```bash
$ python3 -c "import secrets; print(secrets.token_urlsafe(32))"
kX9z_bR7mQ2vL4nT8wP1jY6cA3hF5dS0eU9iK7oN
```

Then paste the result into your `.env` file:

```bash
SSBS_API_KEY=kX9z_bR7mQ2vL4nT8wP1jY6cA3hF5dS0eU9iK7oN
```

This key is what external applications must send in the `X-API-Key` HTTP header
to access the API. You only need to generate it once.
