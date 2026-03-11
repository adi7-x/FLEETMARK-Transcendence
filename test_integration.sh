#!/bin/bash
# ── Fleetmark Integration Test Suite ──
# Tests the complete Frontend ↔ Backend API integration

BASE="http://127.0.0.1:8000"
PROXY="http://localhost:5173"
PASS=0
FAIL=0
BLOCKED=0
RESULTS=""

log_pass() { PASS=$((PASS+1)); RESULTS="$RESULTS\nPASS|$1|$2"; echo "  ✅ $1"; }
log_fail() { FAIL=$((FAIL+1)); RESULTS="$RESULTS\nFAIL|$1|$2|$3"; echo "  ❌ $1: $3"; }
log_block() { BLOCKED=$((BLOCKED+1)); RESULTS="$RESULTS\nBLOCK|$1|$2"; echo "  ⚠️  $1: $2"; }

get_token() {
  curl -s -X POST "$BASE/api/v1/accounts/token/" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$1\", \"password\": \"$2\"}" 2>/dev/null
}

# ═══════════════════════════════════════
# TEST 1: AUTH FLOW
# ═══════════════════════════════════════
echo ""
echo "═══ TEST 1: AUTH FLOW ═══"

# 1.1 Admin Login
echo "  Testing admin login..."
RESP=$(get_token "orgadmin" "pass123")
HTTP=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('200')" 2>/dev/null || echo "ERR")
ACC=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access',''))" 2>/dev/null)
REF=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh',''))" 2>/dev/null)
if [ -n "$ACC" ] && [ "$ACC" != "" ] && [ "$ACC" != "None" ]; then
  log_pass "1.1 Admin Login" "POST /accounts/token/ → 200, access+refresh returned"
  ADMIN_ACCESS="$ACC"
  ADMIN_REFRESH="$REF"
else
  log_fail "1.1 Admin Login" "200 with tokens" "Failed to obtain tokens" "$RESP"
fi

# 1.2 Passenger Login
echo "  Testing passenger login..."
RESP=$(get_token "passenger" "pass123")
PACC=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access',''))" 2>/dev/null)
if [ -n "$PACC" ] && [ "$PACC" != "" ] && [ "$PACC" != "None" ]; then
  log_pass "1.2 Passenger Login" "POST /accounts/token/ → 200"
  PASSENGER_ACCESS="$PACC"
else
  log_fail "1.2 Passenger Login" "200 with tokens" "Failed" "$RESP"
fi

# 1.3 Driver Login
echo "  Testing driver login..."
RESP=$(get_token "driver" "pass123")
DACC=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access',''))" 2>/dev/null)
if [ -n "$DACC" ] && [ "$DACC" != "" ] && [ "$DACC" != "None" ]; then
  log_pass "1.3 Driver Login" "POST /accounts/token/ → 200"
  DRIVER_ACCESS="$DACC"
else
  log_fail "1.3 Driver Login" "200 with tokens" "Failed" "$RESP"
fi

# 1.4 Wrong Password
echo "  Testing wrong password..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/accounts/token/" \
  -H "Content-Type: application/json" \
  -d '{"username": "orgadmin", "password": "wrongpassword"}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
if [ "$CODE" = "401" ]; then
  log_pass "1.4 Wrong Password Rejected" "401 Unauthorized returned"
else
  log_fail "1.4 Wrong Password Rejected" "401" "Got $CODE" ""
fi

# 1.5 Token Verify (valid)
echo "  Testing token verify..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/accounts/token/verify/" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$ADMIN_ACCESS\"}" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "1.5 Token Verify (valid)" "POST /accounts/token/verify/ → 200"
else
  log_fail "1.5 Token Verify (valid)" "200" "Got $CODE" ""
fi

# 1.5b Token Verify (invalid)
echo "  Testing invalid token verify..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/accounts/token/verify/" \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid.token.here"}' 2>/dev/null)
if [ "$CODE" = "401" ]; then
  log_pass "1.5b Token Verify (invalid)" "POST /accounts/token/verify/ → 401"
else
  log_fail "1.5b Token Verify (invalid)" "401" "Got $CODE" ""
fi

# 1.6 Token Refresh
echo "  Testing token refresh..."
RESP=$(curl -s -X POST "$BASE/api/v1/accounts/token/refresh/" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\": \"$ADMIN_REFRESH\"}" 2>/dev/null)
NEW_ACC=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access',''))" 2>/dev/null)
if [ -n "$NEW_ACC" ] && [ "$NEW_ACC" != "" ] && [ "$NEW_ACC" != "None" ]; then
  log_pass "1.6 Token Refresh" "New access token obtained, rotation works"
  ADMIN_ACCESS="$NEW_ACC"
else
  log_fail "1.6 Token Refresh" "New access token" "Failed" "$RESP"
fi

# 1.7 Unauthenticated Access Blocked
echo "  Testing unauthenticated access..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/buses/" 2>/dev/null)
if [ "$CODE" = "401" ] || [ "$CODE" = "403" ]; then
  log_pass "1.7 Unauthenticated Access Blocked" "GET /buses/ without token → $CODE"
else
  log_fail "1.7 Unauthenticated Access Blocked" "401/403" "Got $CODE" ""
fi

# 1.8 Authenticated Access
echo "  Testing authenticated access..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "1.8 Authenticated Access" "GET /buses/ with token → 200"
else
  log_fail "1.8 Authenticated Access" "200" "Got $CODE" ""
fi

# 1.9 JWT Decode + User Profile Fetch
echo "  Testing JWT decode + profile fetch..."
USER_ID=$(python3 -c "
import base64, json
token = '$ADMIN_ACCESS'
payload = token.split('.')[1]
payload += '=' * (4 - len(payload) % 4)
print(json.loads(base64.b64decode(payload))['user_id'])
" 2>/dev/null)
PROFILE=$(curl -s "$BASE/api/v1/accounts/users/$USER_ID/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
UNAME=$(echo "$PROFILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('username',''))" 2>/dev/null)
UROLE=$(echo "$PROFILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('role',''))" 2>/dev/null)
if [ "$UNAME" = "orgadmin" ] && [ "$UROLE" = "admin" ]; then
  log_pass "1.9 JWT Decode + Profile" "user_id=$USER_ID → username=orgadmin, role=admin"
else
  log_fail "1.9 JWT Decode + Profile" "orgadmin/admin" "Got $UNAME/$UROLE" ""
fi

# 1.10 Vite Proxy
echo "  Testing Vite proxy..."
PROXY_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$PROXY/api/v1/accounts/token/" \
  -H "Content-Type: application/json" \
  -d '{"username": "orgadmin", "password": "pass123"}' 2>/dev/null)
if [ "$PROXY_CODE" = "200" ]; then
  log_pass "1.10 Vite Dev Proxy" "POST through localhost:5173/api/ → 200"
else
  log_fail "1.10 Vite Dev Proxy" "200" "Got $PROXY_CODE" ""
fi

# ═══════════════════════════════════════
# TEST 2: ADMIN FLOWS
# ═══════════════════════════════════════
echo ""
echo "═══ TEST 2: ADMIN FLOWS ═══"

# 2.1 List Buses
echo "  Testing list buses..."
RESP=$(curl -s "$BASE/api/v1/buses/" -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$COUNT" ] && [ "$COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "2.1 List Buses" "GET /buses/ → $COUNT buses returned"
else
  log_fail "2.1 List Buses" ">0 buses" "Got $COUNT" "$RESP"
fi

# 2.2 Create Bus
echo "  Testing create bus..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"matricule": "TEST-BUS-INTEG", "capacity": 25}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
NEW_BUS_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ "$CODE" = "201" ] && [ -n "$NEW_BUS_ID" ]; then
  log_pass "2.2 Create Bus" "POST /buses/ → 201, id=$NEW_BUS_ID"
else
  log_fail "2.2 Create Bus" "201" "Got $CODE" "$BODY"
fi

# 2.3 Update Bus
echo "  Testing update bus..."
if [ -n "$NEW_BUS_ID" ] && [ "$NEW_BUS_ID" != "None" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/v1/buses/$NEW_BUS_ID/" \
    -H "Authorization: Bearer $ADMIN_ACCESS" \
    -H "Content-Type: application/json" \
    -d '{"capacity": 35}' 2>/dev/null)
  if [ "$CODE" = "200" ]; then
    log_pass "2.3 Update Bus" "PATCH /buses/$NEW_BUS_ID/ → 200, capacity changed"
  else
    log_fail "2.3 Update Bus" "200" "Got $CODE" ""
  fi
else
  log_block "2.3 Update Bus" "No bus ID from create test"
fi

# 2.4 Delete Bus
echo "  Testing delete bus..."
if [ -n "$NEW_BUS_ID" ] && [ "$NEW_BUS_ID" != "None" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v1/buses/$NEW_BUS_ID/" \
    -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
  if [ "$CODE" = "204" ]; then
    log_pass "2.4 Delete Bus" "DELETE /buses/$NEW_BUS_ID/ → 204"
  else
    log_fail "2.4 Delete Bus" "204" "Got $CODE" ""
  fi
else
  log_block "2.4 Delete Bus" "No bus ID from create test"
fi

# 2.5 List Routes
echo "  Testing list routes..."
RESP=$(curl -s "$BASE/api/v1/routes/" -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$COUNT" ] && [ "$COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "2.5 List Routes" "GET /routes/ → $COUNT routes"
else
  log_fail "2.5 List Routes" ">0 routes" "Got $COUNT" "$RESP"
fi

# 2.6 Create Route
echo "  Testing create route..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/routes/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"bus": 1, "direction": "TEST → Route → Integration"}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
NEW_ROUTE_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ "$CODE" = "201" ]; then
  log_pass "2.6 Create Route" "POST /routes/ → 201, id=$NEW_ROUTE_ID"
else
  log_fail "2.6 Create Route" "201" "Got $CODE" "$BODY"
fi

# 2.7 List Trips
echo "  Testing list trips..."
RESP=$(curl -s "$BASE/api/v1/trips/" -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
TRIP_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$TRIP_COUNT" ] && [ "$TRIP_COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "2.7 List Trips" "GET /trips/ → $TRIP_COUNT trips"
else
  log_fail "2.7 List Trips" ">0 trips" "Got $TRIP_COUNT" "$RESP"
fi

# 2.8 Create Trip
echo "  Testing create trip..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/trips/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"route": 1, "depart_time": "2026-03-03T21:00:00Z"}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
NEW_TRIP_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ "$CODE" = "201" ]; then
  log_pass "2.8 Create Trip" "POST /trips/ → 201, id=$NEW_TRIP_ID, status=CREATED"
else
  log_fail "2.8 Create Trip" "201" "Got $CODE" "$BODY"
fi

# 2.9 List Reservations (empty initially)
echo "  Testing list reservations..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "2.9 List Reservations" "GET /reservations/ → 200"
else
  log_fail "2.9 List Reservations" "200" "Got $CODE" ""
fi

# 2.10 List Users
echo "  Testing list users..."
RESP=$(curl -s "$BASE/api/v1/accounts/users/" -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
USER_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$USER_COUNT" ] && [ "$USER_COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "2.10 List Users" "GET /accounts/users/ → $USER_COUNT users"
else
  log_fail "2.10 List Users" ">0 users" "Got $USER_COUNT" "$RESP"
fi

# 2.11 List Organizations
echo "  Testing list organizations..."
RESP=$(curl -s "$BASE/api/v1/organization/" -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
ORG_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$ORG_COUNT" ] && [ "$ORG_COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "2.11 List Organizations" "GET /organization/ → $ORG_COUNT orgs"
else
  log_fail "2.11 List Organizations" ">0 orgs" "Got $ORG_COUNT" "$RESP"
fi

# 2.12 Frozen Bus Guard (try to delete bus with routes)
echo "  Testing frozen bus guard..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v1/buses/1/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
if [ "$CODE" = "409" ]; then
  log_pass "2.12 Frozen Bus Guard" "DELETE /buses/1/ → 409 (has routes)"
else
  log_fail "2.12 Frozen Bus Guard" "409" "Got $CODE" "Bus with routes should return FreezeError"
fi

# ═══════════════════════════════════════
# TEST 3: PASSENGER FLOWS
# ═══════════════════════════════════════
echo ""
echo "═══ TEST 3: PASSENGER FLOWS ═══"

# 3.1 Create Reservation (passenger)
echo "  Testing create reservation..."
# Use trip 1 (CREATED status)
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"trip": 1, "passenger_name": "Test Passenger"}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
RES_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ "$CODE" = "201" ]; then
  log_pass "3.1 Create Reservation" "POST /reservations/ → 201, id=$RES_ID"
else
  log_fail "3.1 Create Reservation" "201" "Got $CODE" "$BODY"
fi

# 3.2 Create 2nd Reservation
echo "  Testing 2nd reservation..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"trip": 2, "passenger_name": "Test Passenger"}' 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
RES2_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ "$CODE" = "201" ]; then
  log_pass "3.2 Create 2nd Reservation" "POST /reservations/ → 201, id=$RES2_ID"
else
  log_fail "3.2 Create 2nd Reservation" "201" "Got $CODE" "$BODY"
fi

# 3.3 List Own Reservations
echo "  Testing list reservations..."
RESP=$(curl -s "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" 2>/dev/null)
RES_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ -n "$RES_COUNT" ] && [ "$RES_COUNT" -gt 0 ] 2>/dev/null; then
  log_pass "3.3 List Reservations" "GET /reservations/ → $RES_COUNT reservations"
else
  log_fail "3.3 List Reservations" ">0" "Got $RES_COUNT" "$RESP"
fi

# 3.4 Cancel Reservation
echo "  Testing cancel reservation..."
if [ -n "$RES2_ID" ] && [ "$RES2_ID" != "None" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v1/reservations/$RES2_ID/" \
    -H "Authorization: Bearer $PASSENGER_ACCESS" 2>/dev/null)
  if [ "$CODE" = "204" ]; then
    log_pass "3.4 Cancel Reservation" "DELETE /reservations/$RES2_ID/ → 204"
  else
    log_fail "3.4 Cancel Reservation" "204" "Got $CODE" ""
  fi
else
  log_block "3.4 Cancel Reservation" "No reservation ID from create test"
fi

# 3.5 View Own Profile
echo "  Testing passenger profile..."
P_UID=$(python3 -c "
import base64, json
token = '$PASSENGER_ACCESS'
payload = token.split('.')[1]
payload += '=' * (4 - len(payload) % 4)
print(json.loads(base64.b64decode(payload))['user_id'])
" 2>/dev/null)
RESP=$(curl -s "$BASE/api/v1/accounts/users/$P_UID/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" 2>/dev/null)
PROLE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('role',''))" 2>/dev/null)
if [ "$PROLE" = "passenger" ]; then
  log_pass "3.5 Passenger Profile" "GET /accounts/users/$P_UID/ → role=passenger"
else
  log_fail "3.5 Passenger Profile" "passenger" "Got $PROLE" "$RESP"
fi

# ═══════════════════════════════════════
# TEST 4: DRIVER FLOWS
# ═══════════════════════════════════════
echo ""
echo "═══ TEST 4: DRIVER FLOWS ═══"

# 4.1 Driver can list trips
echo "  Testing driver list trips..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/trips/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "4.1 Driver List Trips" "GET /trips/ → 200"
else
  log_fail "4.1 Driver List Trips" "200" "Got $CODE" ""
fi

# 4.2 Driver can list routes
echo "  Testing driver list routes..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/routes/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "4.2 Driver List Routes" "GET /routes/ → 200"
else
  log_fail "4.2 Driver List Routes" "200" "Got $CODE" ""
fi

# 4.3 Driver can list buses
echo "  Testing driver list buses..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "4.3 Driver List Buses" "GET /buses/ → 200"
else
  log_fail "4.3 Driver List Buses" "200" "Got $CODE" ""
fi

# 4.4 Driver can view passenger list (reservations)
echo "  Testing driver list reservations..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
if [ "$CODE" = "200" ]; then
  log_pass "4.4 Driver List Reservations" "GET /reservations/ → 200"
else
  log_fail "4.4 Driver List Reservations" "200" "Got $CODE" ""
fi

# 4.5 Start Trip (need reservation first)
echo "  Testing start trip..."
# First add a reservation to this trip so it can start
curl -s -X POST "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Content-Type: application/json" \
  -d "{\"trip\": $NEW_TRIP_ID, \"passenger_name\": \"Driver Test\"}" > /dev/null 2>&1
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/trips/$NEW_TRIP_ID/start/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
if [ "$CODE" = "200" ]; then
  log_pass "4.5 Start Trip" "POST /trips/$NEW_TRIP_ID/start/ → 200"
else
  log_fail "4.5 Start Trip" "200" "Got $CODE" "$BODY"
fi

# 4.6 End Trip
echo "  Testing end trip..."
RESP=$(curl -s -w "|%{http_code}" -X POST "$BASE/api/v1/trips/$NEW_TRIP_ID/end/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
CODE=$(echo "$RESP" | rev | cut -d'|' -f1 | rev)
BODY=$(echo "$RESP" | sed 's/|[0-9]*$//')
if [ "$CODE" = "200" ]; then
  log_pass "4.6 End Trip" "POST /trips/$NEW_TRIP_ID/end/ → 200"
else
  log_fail "4.6 End Trip" "200" "Got $CODE" "$BODY"
fi

# 4.7 Start Trip with No Reservations (should fail)
echo "  Testing start trip no reservations..."
# Create a fresh trip with no reservations
EMPTY_TRIP=$(curl -s -X POST "$BASE/api/v1/trips/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"route": 2, "depart_time": "2026-03-04T23:00:00Z"}' 2>/dev/null)
EMPTY_ID=$(echo "$EMPTY_TRIP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$EMPTY_ID" ] && [ "$EMPTY_ID" != "None" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/trips/$EMPTY_ID/start/" \
    -H "Authorization: Bearer $DRIVER_ACCESS" 2>/dev/null)
  if [ "$CODE" = "400" ]; then
    log_pass "4.7 Start Trip No Reservations" "POST /trips/$EMPTY_ID/start/ → 400 (lifecycle_error)"
  else
    log_fail "4.7 Start Trip No Reservations" "400" "Got $CODE" ""
  fi
else
  log_block "4.7 Start Trip No Reservations" "Could not create empty trip"
fi

# ═══════════════════════════════════════
# TEST 5: EDGE CASES
# ═══════════════════════════════════════
echo ""
echo "═══ TEST 5: EDGE CASES ═══"

# 5.1 Passenger cannot create bus
echo "  Testing passenger cannot create bus..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"matricule": "HACK-BUS", "capacity": 10}' 2>/dev/null)
if [ "$CODE" = "403" ]; then
  log_pass "5.1 Passenger Cannot Create Bus" "POST /buses/ → 403 Forbidden"
else
  log_fail "5.1 Passenger Cannot Create Bus" "403" "Got $CODE" ""
fi

# 5.2 Driver cannot create bus
echo "  Testing driver cannot create bus..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $DRIVER_ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"matricule": "HACK-BUS-2", "capacity": 10}' 2>/dev/null)
if [ "$CODE" = "403" ]; then
  log_pass "5.2 Driver Cannot Create Bus" "POST /buses/ → 403 Forbidden"
else
  log_fail "5.2 Driver Cannot Create Bus" "403" "Got $CODE" ""
fi

# 5.3 Reserve on ENDED trip (should fail)
echo "  Testing reserve on ended trip..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v1/reservations/" \
  -H "Authorization: Bearer $PASSENGER_ACCESS" \
  -H "Content-Type: application/json" \
  -d "{\"trip\": $NEW_TRIP_ID, \"passenger_name\": \"Late Passenger\"}" 2>/dev/null)
if [ "$CODE" = "400" ]; then
  log_pass "5.3 Reserve on Ended Trip" "POST /reservations/ → 400 (lifecycle_error)"
else
  log_fail "5.3 Reserve on Ended Trip" "400" "Got $CODE" "Trip $NEW_TRIP_ID is ENDED"
fi

# 5.4 Invalid token
echo "  Testing invalid token..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer invalid.jwt.token" 2>/dev/null)
if [ "$CODE" = "401" ]; then
  log_pass "5.4 Invalid Token Rejected" "GET /buses/ with bad token → 401"
else
  log_fail "5.4 Invalid Token Rejected" "401" "Got $CODE" ""
fi

# 5.5 Delete route with trips (protected)
echo "  Testing delete route with trips..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v1/routes/1/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null)
if [ "$CODE" = "409" ]; then
  log_pass "5.5 Delete Route With Trips" "DELETE /routes/1/ → 409 (protected)"
else
  log_fail "5.5 Delete Route With Trips" "409" "Got $CODE" ""
fi

# 5.6 Frontend serves SPA
echo "  Testing frontend SPA..."
F_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROXY/" 2>/dev/null)
if [ "$F_CODE" = "200" ]; then
  log_pass "5.6 Frontend SPA Serves" "GET localhost:5173/ → 200"
else
  log_fail "5.6 Frontend SPA Serves" "200" "Got $F_CODE" ""
fi

# 5.7 CORS Check (Origin header)
echo "  Testing CORS headers..."
RESP=$(curl -s -D- -o /dev/null "$BASE/api/v1/buses/" \
  -H "Authorization: Bearer $ADMIN_ACCESS" \
  -H "Origin: http://localhost:5173" 2>/dev/null)
CORS_HDR=$(echo "$RESP" | grep -i "access-control-allow-origin" | head -1)
if [ -n "$CORS_HDR" ]; then
  log_pass "5.7 CORS Headers Present" "$CORS_HDR"
else
  log_fail "5.7 CORS Headers Missing" "Access-Control-Allow-Origin header" "No CORS header found" "Backend needs django-cors-headers. Dev proxy bypasses this."
fi

# Cleanup: delete test route if created
if [ -n "$NEW_ROUTE_ID" ] && [ "$NEW_ROUTE_ID" != "None" ]; then
  curl -s -o /dev/null -X DELETE "$BASE/api/v1/routes/$NEW_ROUTE_ID/" \
    -H "Authorization: Bearer $ADMIN_ACCESS" 2>/dev/null
fi

# ═══════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════
echo ""
echo "═══════════════════════════════════════"
TOTAL=$((PASS + FAIL + BLOCKED))
echo "  TOTAL: $TOTAL | PASS: $PASS | FAIL: $FAIL | BLOCKED: $BLOCKED"
echo "═══════════════════════════════════════"
echo ""

# Write results to temp file for report generation
echo "$PASS|$FAIL|$BLOCKED" > /tmp/fleetmark_test_summary.txt
echo -e "$RESULTS" > /tmp/fleetmark_test_results.txt
