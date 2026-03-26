// Test script to simulate the authentication flow
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000/api/v1';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Get OAuth URL
    console.log('1. Testing OAuth login endpoint...');
    const loginRes = await fetch(`${API_BASE}/auth/42/login/`);
    const loginData = await loginRes.json();
    
    if (loginData.authorization_url) {
      console.log('✅ OAuth URL generated successfully');
      console.log(`   URL: ${loginData.authorization_url.substring(0, 50)}...`);
    } else {
      console.log('❌ Failed to get OAuth URL');
      return;
    }
    
    // Test 2: Test protected endpoint without auth
    console.log('\n2. Testing protected endpoint without auth...');
    const stationsRes = await fetch(`${API_BASE}/stations/`);
    if (stationsRes.status === 401) {
      console.log('✅ Protected endpoint correctly requires authentication');
    } else {
      console.log('❌ Protected endpoint should require authentication');
    }
    
    // Test 3: Test token refresh endpoint
    console.log('\n3. Testing token refresh endpoint...');
    const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: 'invalid_token' })
    });
    
    if (refreshRes.status === 401) {
      console.log('✅ Token refresh correctly rejects invalid tokens');
    } else {
      console.log('❌ Token refresh should reject invalid tokens');
    }
    
    console.log('\n🎉 Auth flow tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();
