#!/bin/bash

echo "🧪 Testing Frontend Flow..."
echo ""

# Test 1: Check if frontend is running
echo "1. Testing frontend availability..."
if curl -s http://localhost:5174 > /dev/null; then
    echo "✅ Frontend is running on port 5174"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

# Test 2: Check if backend is running
echo ""
echo "2. Testing backend availability..."
if curl -s http://localhost:8000/api/v1/auth/42/login/ > /dev/null; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend is not accessible"
    exit 1
fi

# Test 3: Check OAuth endpoint
echo ""
echo "3. Testing OAuth endpoint..."
OAUTH_URL=$(curl -s http://localhost:8000/api/v1/auth/42/login/ | jq -r '.authorization_url')
if [[ $OAUTH_URL == https://api.intra.42.fr* ]]; then
    echo "✅ OAuth URL is correctly generated"
else
    echo "❌ OAuth URL generation failed"
fi

# Test 4: Check protected endpoints
echo ""
echo "4. Testing protected endpoints..."
STATIONS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/stations/)
if [[ $STATIONS_STATUS == "401" ]]; then
    echo "✅ Stations endpoint correctly requires authentication"
else
    echo "❌ Stations endpoint should require authentication (got $STATIONS_STATUS)"
fi

BUSES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/buses/)
if [[ $BUSES_STATUS == "401" ]]; then
    echo "✅ Buses endpoint correctly requires authentication"
else
    echo "❌ Buses endpoint should require authentication (got $BUSES_STATUS)"
fi

echo ""
echo "🎉 Frontend flow tests completed!"
