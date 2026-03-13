# BACKEND_API.md — SSBS Backend API Reference

---

## BASE URL

| Environment | URL |
|-------------|-----|
| Local (Docker) | `http://localhost:8000/api/v1` |
| Frontend proxy | `http://localhost:8000/api` (via `VITE_API_URL`) |
| Production | Not configured yet |

---

## AUTHENTICATION

### How it works

SSBS uses **42 Intra OAuth2** for login and **JWT (SimpleJWT)** for session tokens.

```
Authorization: Bearer <access_token>
```

### How to get a token

1. `GET /api/v1/auth/42/login/` → returns an `authorization_url`
2. Redirect user's browser to that URL
3. 42 redirects back to `GET /api/v1/auth/42/callback/?code=<code>`
4. Backend returns `{ access, refresh, user }`
5. Use `access` as Bearer token on all authenticated requests
6. When `access` expires → `POST /api/v1/auth/token/refresh/` with `{ refresh }` → get new `access`

### Token lifetimes

| Token | Lifetime |
|-------|----------|
| Access | 60 minutes |
| Refresh | 7 days |

### Default permission

Settings define `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`, but **every view currently overrides this with `AllowAny`** except `/auth/me/` (which requires authentication).

---

## ALL ENDPOINTS

---

### 1 — Authentication (`/api/v1/auth/`)

---

#### GET /api/v1/auth/42/login/

**What:** Returns the 42 OAuth authorization URL.
**Who:** Anyone
**Auth:** No

**Response 200**

```json
{
  "authorization_url": "https://api.intra.42.fr/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=public"
}
```

---

#### GET /api/v1/auth/42/callback/?code={code}

**What:** Exchanges 42 auth code for JWT tokens + user profile.
**Who:** Anyone (browser redirect)
**Auth:** No

**Response 200**

```json
{
  "access": "string (JWT)",
  "refresh": "string (JWT)",
  "user": {
    "id": "uuid",
    "login_42": "string",
    "email": "string",
    "role": "STUDENT | LOGISTICS_STAFF",
    "station": "uuid | null",
    "station_name": "string | null",
    "is_active": true,
    "created_at": "datetime"
  }
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"error": "Missing authorization code."}` | No `code` query param |
| 502 | `{"error": "Failed to obtain access token from 42."}` | 42 token exchange failed |
| 502 | `{"error": "Failed to fetch user profile from 42."}` | 42 profile API failed |
| 502 | `{"error": "Incomplete profile data from 42."}` | Profile missing `login` or `email` |

---

#### POST /api/v1/auth/token/refresh/

**What:** Returns a new access token from a valid refresh token.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "refresh": "string (JWT)"
}
```

**Response 200**

```json
{
  "access": "string (JWT)"
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 401 | `{"detail": "Token is invalid or expired", "code": "token_not_valid"}` | Bad or expired refresh token |

---

#### GET /api/v1/auth/me/

**What:** Returns the current user's profile.
**Who:** Any authenticated user
**Auth:** **Yes**

**Response 200**

```json
{
  "id": "uuid",
  "login_42": "string",
  "email": "string",
  "role": "STUDENT | LOGISTICS_STAFF | DRIVER",
  "station": "uuid | null",
  "station_name": "string | null",
  "is_active": true,
  "created_at": "datetime"
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 401 | `{"detail": "Authentication credentials were not provided."}` | No token |
| 401 | `{"detail": "Given token not valid for any token type"}` | Expired/invalid token |

---

#### PATCH /api/v1/auth/me/

**What:** Update current user's profile (only `station` is writable).
**Who:** Any authenticated user
**Auth:** **Yes**

**Request**

```json
{
  "station": "uuid | null"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "login_42": "string",
  "email": "string",
  "role": "string",
  "station": "uuid | null",
  "station_name": "string | null",
  "is_active": true,
  "created_at": "datetime"
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"station": ["Invalid pk ... - object does not exist."]}` | Station UUID not found |
| 401 | `{"detail": "Authentication credentials were not provided."}` | No token |

**Read-only fields:** `id`, `login_42`, `email`, `role`, `is_active`, `created_at`

---

### 2 — Stations (`/api/v1/stations/`)

---

#### GET /api/v1/stations/

**What:** List all stations.
**Who:** Anyone
**Auth:** No (AllowAny)

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "created_at": "datetime"
  }
]
```

Ordered by `name` (ascending alphabetical).

---

#### POST /api/v1/stations/

**What:** Create a new station.
**Who:** Anyone (AllowAny — no role check)
**Auth:** No

**Request**

```json
{
  "name": "string"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "datetime"
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"name": ["station with this name already exists."]}` | Duplicate name |
| 400 | `{"name": ["This field is required."]}` | Missing name |

---

#### GET /api/v1/stations/{id}/

**What:** Retrieve a single station.
**Who:** Anyone
**Auth:** No

**Response 200** — Same as list item shape.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | UUID does not exist |

---

#### PUT /api/v1/stations/{id}/

**What:** Full update of a station.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "name": "string"
}
```

**Response 200** — Updated station.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"name": ["station with this name already exists."]}` | Duplicate name |
| 404 | `{"detail": "Not found."}` | UUID not found |

---

#### PATCH /api/v1/stations/{id}/

**What:** Partial update of a station.
**Who:** Anyone
**Auth:** No

**Request** (partial)

```json
{
  "name": "string"
}
```

**Response 200** — Updated station.

---

#### DELETE /api/v1/stations/{id}/

**What:** Delete a station (if not used by a route).
**Who:** Anyone
**Auth:** No

**Response 204** — No content.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "Station is referenced by one or more routes."}` | Station is in a RouteStation |
| 404 | `{"detail": "Not found."}` | UUID not found |

---

### 3 — Buses (`/api/v1/buses/`)

---

#### GET /api/v1/buses/

**What:** List all buses.
**Who:** Anyone
**Auth:** No

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "plate": "string",
    "seat_capacity": "integer",
    "created_at": "datetime"
  }
]
```

Ordered by `name`.

---

#### POST /api/v1/buses/

**What:** Create a bus.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "name": "string",
  "plate": "string",
  "seat_capacity": "integer (positive)"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "string",
  "plate": "string",
  "seat_capacity": "integer",
  "created_at": "datetime"
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"plate": ["bus with this plate already exists."]}` | Duplicate plate |
| 400 | `{"seat_capacity": ["This field is required."]}` | Missing field |

---

#### GET /api/v1/buses/{id}/

**What:** Retrieve one bus.
**Who:** Anyone
**Auth:** No

**Response 200** — Same shape as list item.

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/buses/{id}/

**What:** Full update.
**Who:** Anyone
**Auth:** No

**Request** — Same as POST.
**Response 200** — Updated bus.

---

#### PATCH /api/v1/buses/{id}/

**What:** Partial update.
**Who:** Anyone
**Auth:** No

**Request** (partial)

```json
{
  "seat_capacity": 60
}
```

**Response 200** — Updated bus.

---

#### DELETE /api/v1/buses/{id}/

**What:** Delete a bus (if no trip references it).
**Who:** Anyone
**Auth:** No

**Response 204** — No content.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "Bus is referenced by one or more trips."}` | Bus assigned to a trip |
| 404 | `{"detail": "Not found."}` | Not found |

---

### 4 — Routes (`/api/v1/routes/`)

---

#### GET /api/v1/routes/

**What:** List all routes with nested ordered stations.
**Who:** Anyone
**Auth:** No

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "window": "peak | consolidated",
    "created_at": "datetime",
    "stations": [
      {
        "order": 1,
        "station": {
          "id": "uuid",
          "name": "string",
          "created_at": "datetime"
        }
      }
    ]
  }
]
```

Ordered by `name`.

---

#### POST /api/v1/routes/

**What:** Create a route with ordered stations.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "name": "string",
  "window": "peak | consolidated",
  "station_ids": ["uuid", "uuid", "uuid"]
}
```

- `station_ids` is **write-only**. Array order = stop order (index 0 = order 1).
- `stations` is **read-only** in the response (nested objects).

**Response 201** — Full route object with nested stations.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"station_ids": "A route must have at least one station."}` | Missing or empty station_ids |
| 400 | `{"non_field_errors": ["One or more stations do not exist or are duplicated."]}` | Bad UUIDs or duplicates in array |
| 400 | `{"name": ["route with this name already exists."]}` | Duplicate name |
| 400 | `{"window": ["\"x\" is not a valid choice."]}` | Invalid window value |

---

#### GET /api/v1/routes/{id}/

**What:** Retrieve one route with nested stations.
**Who:** Anyone
**Auth:** No

**Response 200** — Same shape as list item.

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/routes/{id}/

**What:** Full update. Providing `station_ids` replaces all existing route stations.
**Who:** Anyone
**Auth:** No

**Request** — Same as POST.
**Response 200** — Updated route with stations.

---

#### PATCH /api/v1/routes/{id}/

**What:** Partial update. If `station_ids` included, replaces stations. If omitted, stations untouched.
**Who:** Anyone
**Auth:** No

**Request** (any subset)

```json
{
  "station_ids": ["uuid", "uuid"]
}
```

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"station_ids": "A route must have at least one station."}` | Empty station_ids array |

---

#### DELETE /api/v1/routes/{id}/

**What:** Delete a route (if no trip references it).
**Who:** Anyone
**Auth:** No

**Response 204** — No content.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "Route is referenced by one or more trips."}` | Route has trips |
| 404 | `{"detail": "Not found."}` | Not found |

---

### 5 — Drivers (`/api/v1/drivers/`)

---

#### GET /api/v1/drivers/

**What:** List all drivers.
**Who:** Anyone
**Auth:** No

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "username": "string",
    "status": "active | inactive",
    "created_at": "datetime"
  }
]
```

> ⚠️ `password` is **never returned** in any response.

Ordered by `name`.

---

#### POST /api/v1/drivers/

**What:** Create a driver.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "name": "string",
  "username": "string",
  "password": "string (required, write-only)",
  "status": "active | inactive (default: active)"
}
```

**Response 201** — Driver object (no password).

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"password": "Password is required."}` | Missing password |
| 400 | `{"username": ["driver with this username already exists."]}` | Duplicate username |

**Notes:** `password` is hashed with Django's `make_password` before storage.

---

#### GET /api/v1/drivers/{id}/

**What:** Retrieve one driver.
**Who:** Anyone
**Auth:** No

**Response 200** — Same as list item (no password).

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/drivers/{id}/

**What:** Full update. Password re-hashed if provided.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "name": "string",
  "username": "string",
  "password": "string (optional on update)",
  "status": "active | inactive"
}
```

**Response 200** — Updated driver (no password).

---

#### PATCH /api/v1/drivers/{id}/

**What:** Partial update. Send `password` to change it.
**Who:** Anyone
**Auth:** No

**Request** (any subset)

```json
{
  "status": "inactive"
}
```

**Response 200** — Updated driver.

---

#### DELETE /api/v1/drivers/{id}/

**What:** Delete driver OR soft-delete (set inactive) if assigned to trips.
**Who:** Anyone
**Auth:** No

**If no trips reference this driver:**
- **Response 204** — Permanently deleted.

**If trips reference this driver:**
- **Response 400** — `{"detail": "Driver is assigned to trips and has been set to inactive."}`
- Driver's `status` is changed to `"inactive"` (not deleted).

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "Driver is assigned to trips and has been set to inactive."}` | Has trips |
| 404 | `{"detail": "Not found."}` | Not found |

---

### 6 — Trips (`/api/v1/trips/`)

---

#### GET /api/v1/trips/

**What:** List all trips (staff view).
**Who:** Anyone
**Auth:** No

**Response 200**

```json
[
  {
    "id": "uuid",
    "route": "uuid (FK)",
    "bus": "uuid (FK)",
    "driver": "uuid (FK)",
    "departure_datetime": "datetime",
    "seats": "integer",
    "archived_at": "datetime | null",
    "created_at": "datetime"
  }
]
```

Ordered by `departure_datetime`.

---

#### POST /api/v1/trips/

**What:** Create a trip.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "route": "uuid",
  "bus": "uuid",
  "driver": "uuid",
  "departure_datetime": "datetime",
  "seats": "integer (positive)"
}
```

**Response 201** — Trip object.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"seats": "seats cannot exceed bus seat capacity of {N}."}` | `seats` > bus `seat_capacity` |
| 400 | `{"route": ["Invalid pk ... - object does not exist."]}` | Bad route UUID |
| 400 | `{"bus": ["Invalid pk ... - object does not exist."]}` | Bad bus UUID |
| 400 | `{"driver": ["Invalid pk ... - object does not exist."]}` | Bad driver UUID |

---

#### GET /api/v1/trips/{id}/

**What:** Retrieve one trip.
**Who:** Anyone
**Auth:** No

**Response 200** — Trip object.

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/trips/{id}/

**What:** Full update.
**Who:** Anyone
**Auth:** No

**Request** — Same as POST.
**Response 200** — Updated trip.

---

#### PATCH /api/v1/trips/{id}/

**What:** Partial update.
**Who:** Anyone
**Auth:** No

**Request** (any subset)

```json
{
  "seats": 45
}
```

**Response 200** — Updated trip. Seat validation still applies.

---

#### DELETE /api/v1/trips/{id}/

**What:** Delete a trip (cascades to all its reservations).
**Who:** Anyone
**Auth:** No

**Response 204** — No content.

| Status | Message | Trigger |
|--------|---------|---------|
| 404 | `{"detail": "Not found."}` | Not found |

---

#### GET /api/v1/trips/available/?station_id={uuid}

**What:** Browse trips available to a student at their station. Respects time windows.
**Who:** Students
**Auth:** No

**Query Parameters**

| Param | Type | Required |
|-------|------|----------|
| `station_id` | uuid | **Yes** |

**Time window logic (server local time — `Africa/Casablanca`):**

| Local Time | Behavior |
|------------|----------|
| 20:00 – 23:59 | Returns trips on `window = "peak"` routes passing through `station_id` |
| 00:00 – 00:59 | Returns `[]` (transition period) |
| 01:00 – 05:59 | Returns trips on `window = "consolidated"` routes passing through `station_id` |
| 06:00 – 19:59 | Returns `[]` (outside service hours) |

**Filters applied:**
1. `archived_at IS NULL` (active only)
2. Route includes `station_id` in its RouteStation list
3. `reservation_count < seats` (not full)
4. Ordered by `departure_datetime` ascending

**Response 200**

```json
[
  {
    "id": "uuid",
    "route": "uuid",
    "bus": "uuid",
    "driver": "uuid",
    "departure_datetime": "datetime",
    "seats": "integer",
    "archived_at": null,
    "created_at": "datetime"
  }
]
```

Empty `[]` = no trips available (not an error).

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "station_id is required."}` | Missing query param |

---

### 7 — Reservations (`/api/v1/reservations/`)

---

#### GET /api/v1/reservations/?user_id={uuid}

**What:** List active reservations for a student (trip not archived).
**Who:** Students
**Auth:** No

**Query Parameters**

| Param | Type | Required |
|-------|------|----------|
| `user_id` | uuid | **Yes** |

**Response 200**

```json
[
  {
    "id": "uuid",
    "trip": "uuid (FK)",
    "student": "uuid (FK)",
    "created_at": "datetime"
  }
]
```

Ordered by `created_at` descending. Filters: `trip.archived_at IS NULL`.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "user_id is required."}` | Missing query param |

---

#### POST /api/v1/reservations/

**What:** Reserve a seat on a trip.
**Who:** Students
**Auth:** No

**Request**

```json
{
  "trip": "uuid",
  "user_id": "uuid"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "trip": "uuid",
  "student": "uuid",
  "created_at": "datetime"
}
```

**Seat locking:** Uses `SELECT ... FOR UPDATE` inside a DB transaction. Two concurrent requests for the last seat = only one succeeds. Unique constraint `(trip, student)` prevents double-booking at DB level.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "trip and user_id are required."}` | Missing fields |
| 400 | `{"detail": "Trip is no longer available."}` | Trip is archived |
| 400 | `{"detail": "Trip is fully booked."}` | Reservations ≥ seats |
| 400 | `{"detail": "Already reserved."}` | Student already booked this trip |
| 404 | `{"detail": "Trip not found."}` | Trip UUID doesn't exist |

---

#### GET /api/v1/reservations/history/?user_id={uuid}

**What:** List archived reservations for a student (trip is archived).
**Who:** Students
**Auth:** No

**Query Parameters**

| Param | Type | Required |
|-------|------|----------|
| `user_id` | uuid | **Yes** |

**Response 200** — Same shape as active list. Filters: `trip.archived_at IS NOT NULL`.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "user_id is required."}` | Missing query param |

---

#### DELETE /api/v1/reservations/{id}/?user_id={uuid}

**What:** Cancel a reservation.
**Who:** Students (owner only)
**Auth:** No

**Query Parameters**

| Param | Type | Required |
|-------|------|----------|
| `user_id` | uuid | **Yes** (must match reservation owner) |

**Response 204** — Deleted. Seat becomes available again.

**Errors**

| Status | Message | Trigger |
|--------|---------|---------|
| 400 | `{"detail": "user_id is required."}` | Missing query param |
| 400 | `{"detail": "Cannot cancel a reservation for an archived trip."}` | Trip is archived |
| 404 | (empty body) | Reservation not found or user_id mismatch |

---

### 8 — Reports (`/api/v1/reports/`) [MISSING]

**Status:** No endpoints implemented. `urls.py` has empty `urlpatterns = []`. Models, views, and serializers are placeholder stubs.

---

## ALL MODELS

---

### User (`apps.users`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `login_42` | CharField(100) | Yes (nullable, blank) | Unique |
| `email` | EmailField | No | Unique, used as USERNAME_FIELD |
| `role` | CharField(20) | No | Choices: `STUDENT`, `LOGISTICS_STAFF`, `DRIVER`. Default: `STUDENT` |
| `station` | ForeignKey → Station | Yes (nullable) | SET_NULL on delete |
| `is_active` | BooleanField | No | Default: True |
| `is_staff` | BooleanField | No | Default: False |
| `created_at` | DateTimeField | No | Auto-set on create |
| `password` | CharField | No | Inherited from AbstractBaseUser |
| `last_login` | DateTimeField | Yes | Inherited from AbstractBaseUser |

---

### Station (`apps.stations`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `name` | CharField(100) | No | Unique |
| `created_at` | DateTimeField | No | Auto-set on create |

Ordering: `name` ascending.

---

### Bus (`apps.buses`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `name` | CharField(100) | No | |
| `plate` | CharField(20) | No | Unique |
| `seat_capacity` | PositiveIntegerField | No | |
| `created_at` | DateTimeField | No | Auto-set on create |

Ordering: `name` ascending.

---

### Route (`apps.routes`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `name` | CharField(100) | No | Unique |
| `window` | CharField(20) | No | Choices: `peak`, `consolidated` |
| `created_at` | DateTimeField | No | Auto-set on create |

Ordering: `name` ascending.

---

### RouteStation (`apps.routes`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | AutoField (PK) | No | Django default |
| `route` | ForeignKey → Route | No | CASCADE, `related_name='route_stations'` |
| `station` | ForeignKey → Station | No | PROTECT |
| `order` | PositiveIntegerField | No | |

Constraints: `unique_together = [('route', 'order'), ('route', 'station')]`
Ordering: `order` ascending.

---

### Driver (`apps.drivers`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `name` | CharField(100) | No | |
| `username` | CharField(100) | No | Unique |
| `password` | CharField(255) | No | Stored hashed via `make_password` |
| `status` | CharField(20) | No | Choices: `active`, `inactive`. Default: `active` |
| `created_at` | DateTimeField | No | Auto-set on create |

Ordering: `name` ascending.

---

### Trip (`apps.trips`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `route` | ForeignKey → Route | No | PROTECT |
| `bus` | ForeignKey → Bus | No | PROTECT |
| `driver` | ForeignKey → Driver | No | PROTECT |
| `departure_datetime` | DateTimeField | No | |
| `seats` | PositiveIntegerField | No | Must be ≤ bus.seat_capacity |
| `archived_at` | DateTimeField | Yes (nullable) | Default: null |
| `created_at` | DateTimeField | No | Auto-set on create |

Ordering: `departure_datetime` ascending.

---

### Reservation (`apps.reservations`)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | UUIDField (PK) | No | Auto-generated |
| `trip` | ForeignKey → Trip | No | CASCADE, `related_name='reservations'` |
| `student` | ForeignKey → User | No | CASCADE |
| `created_at` | DateTimeField | No | Auto-set on create |

Constraints: `unique_together = [('trip', 'student')]`
Ordering: `-created_at` (newest first).

---

### Report (`apps.reports`) [MISSING]

No model fields defined. File contains only: `# Models will be implemented in the next session`

---

## MISSING / NOT YET IMPLEMENTED

| Item | Status | Details |
|------|--------|---------|
| **Reports app — all endpoints** | [MISSING] | `urls.py` is empty. Models, views, serializers are stubs with placeholder comments. |
| **POST /api/v1/reports/** | [MISSING] | Student submits a report — not implemented |
| **GET /api/v1/reports/** | [MISSING] | Staff lists reports — not implemented |
| **GET /api/v1/reports/{id}/** | [MISSING] | Staff views a report — not implemented |
| **PATCH /api/v1/reports/{id}/** | [MISSING] | Staff updates report status — not implemented |
| **DELETE /api/v1/reports/{id}/** | [MISSING] | Staff deletes a report — not implemented |
| **`archive_trips` management command** | [MISSING] | File exists at `apps/trips/management/commands/archive_trips.py` but `handle()` is empty (`pass`). Help text says "Archive trips — stub". |
| **Role-based permissions** | [MISSING] | Settings define `IsAuthenticated` as default, but every view overrides with `AllowAny`. No `IsAdminUser` or custom permission classes exist. Staff-only endpoints (stations/buses/routes/drivers/trips CRUD) have no role checks. |
| **Reports tests** | [MISSING] | `apps/reports/tests.py` has no tests (default Django stub). |

---

## KNOWN BUGS

### 1. No permission enforcement on admin endpoints

**Severity:** High
**Where:** All views in stations, buses, routes, drivers, trips, reservations
**Problem:** Every view sets `permission_classes = [AllowAny]`. This means any unauthenticated user can create, update, or delete stations, buses, routes, drivers, and trips. The settings file has `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` but it's overridden everywhere.
**Impact:** Any anonymous user can mutate all data.

### 2. Reservations use `user_id` body/query param instead of JWT user

**Severity:** High
**Where:** `apps/reservations/views.py` — all views
**Problem:** Reservations identify the student via a `user_id` parameter in the request body or query string, not from the JWT token's `request.user`. Combined with `AllowAny`, anyone can create/delete reservations for any user by passing their UUID.
**Impact:** No ownership verification. A user can cancel another user's reservation or book on their behalf.

### 3. DELETE on reservations reads `user_id` from query params, but tests send it in request body

**Severity:** Low
**Where:** `apps/reservations/views.py` line `user_id = request.query_params.get('user_id')` vs `tests.py` using `self.client.delete(url, {'user_id': ...}, format='json')`
**Problem:** DRF's `delete()` with `format='json'` sends data in the request body, but the view reads from `query_params`. In the test the DRF test client may or may not put JSON body data into query_params depending on the method. This could cause test results to differ from real client behavior.
**Impact:** The `DELETE` endpoint may behave differently when called from a real frontend (which would use `?user_id=` in the URL) vs the test suite.

### 4. `archive_trips` cron command does nothing

**Severity:** Medium
**Where:** `apps/trips/management/commands/archive_trips.py`
**Problem:** The command's `handle()` method is `pass`. If a cron job runs this, no trips get archived.
**Impact:** Trips never get auto-archived. The `archived_at` field only changes if staff manually sets it (no endpoint for that either — it's read-only in the serializer).

### 5. No way to archive a trip via the API

**Severity:** Medium
**Where:** `apps/trips/serializers.py`
**Problem:** `archived_at` is in `read_only_fields`. There is no endpoint to set it. The management command is a stub.
**Impact:** Trips cannot be archived through any working mechanism. The reservation history endpoint (which filters by `archived_at IS NOT NULL`) will always return empty results in practice.

### 6. Trip serializer returns FK UUIDs, not nested objects

**Severity:** Low (design choice)
**Where:** `apps/trips/serializers.py`
**Problem:** The `TripSerializer` returns `route`, `bus`, `driver` as raw UUID strings. The `/trips/available/` endpoint uses this same serializer, so the frontend gets no route name/station info in the response.
**Impact:** Frontend needs additional requests to resolve route/bus/driver details when displaying available trips.

### 7. Seats validation edge case on PATCH

**Severity:** Low
**Where:** `apps/trips/serializers.py` — `validate()` method
**Problem:** `seats = attrs.get('seats') or getattr(self.instance, 'seats', None)` — if `seats` is explicitly set to `0` in a PATCH, the `or` will fall through to the instance value because `0` is falsy. Same issue for `bus`.
**Impact:** Setting seats to 0 would bypass validation and use the existing value instead.
