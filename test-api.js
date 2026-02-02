// API Test Script - Tests all endpoints
const API_URL = 'http://localhost:3001/api';

let authToken = '';

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}...`);
    await fn();
    console.log(`✅ ${name} PASSED`);
  } catch (error) {
    console.error(`❌ ${name} FAILED:`, error.message);
  }
}

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

async function runTests() {
  console.log('🚀 Restaurant Autopilot API Test Suite\n');
  console.log('='.repeat(50));
  
  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    if (data.status !== 'healthy') throw new Error('Health check failed');
  });
  
  // Test 2: Login
  await test('Login', async () => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo@restaurant.com',
        password: 'demo123'
      })
    });
    
    if (!data.token) throw new Error('No token received');
    authToken = data.token;
    console.log('   Token:', authToken.substring(0, 20) + '...');
  });
  
  // Test 3: Verify Token
  await test('Verify Token', async () => {
    const data = await apiCall('/auth/verify');
    if (!data.valid) throw new Error('Token invalid');
  });
  
  // Test 4: Get Business
  await test('Get Business', async () => {
    const data = await apiCall('/business');
    if (data.name !== 'Bella Napoli Ristorante') throw new Error('Wrong business');
    console.log('   Business:', data.name);
    console.log('   Rating:', data.rating, '⭐');
  });
  
  // Test 5: Get All Reviews
  await test('Get All Reviews', async () => {
    const data = await apiCall('/reviews');
    if (!data.reviews || data.reviews.length === 0) throw new Error('No reviews');
    console.log('   Total reviews:', data.total);
    console.log('   Responded:', data.stats.responded);
    console.log('   Pending:', data.stats.pending);
  });
  
  // Test 6: Get Filtered Reviews (unanswered)
  await test('Get Unanswered Reviews', async () => {
    const data = await apiCall('/reviews?responded=false');
    console.log('   Unanswered reviews:', data.reviews.length);
  });
  
  // Test 7: Get Single Review
  await test('Get Single Review', async () => {
    const data = await apiCall('/reviews/rev-2');
    if (data.author !== 'Mark Peterson') throw new Error('Wrong review');
    console.log('   Review by:', data.author);
    console.log('   Rating:', data.rating, '⭐');
  });
  
  // Test 8: Generate AI Response
  await test('Generate AI Response', async () => {
    const data = await apiCall('/ai/generate-response', {
      method: 'POST',
      body: JSON.stringify({
        rating: 4,
        text: 'Great food but slow service'
      })
    });
    
    if (!data.response) throw new Error('No response generated');
    console.log('   AI Response:', data.response.substring(0, 50) + '...');
  });
  
  // Test 9: Add Review Response
  await test('Add Review Response', async () => {
    const data = await apiCall('/reviews/rev-2/respond', {
      method: 'POST',
      body: JSON.stringify({
        response: 'Thank you for your feedback! We appreciate your patience.'
      })
    });
    
    if (!data.responded) throw new Error('Response not added');
    console.log('   Response added successfully');
  });
  
  // Test 10: Delete Review Response
  await test('Delete Review Response', async () => {
    const data = await apiCall('/reviews/rev-2/respond', {
      method: 'DELETE'
    });
    
    if (data.responded) throw new Error('Response not deleted');
    console.log('   Response deleted successfully');
  });
  
  // Test 11: Analytics Overview
  await test('Analytics Overview', async () => {
    const data = await apiCall('/analytics/overview');
    if (!data.reviews) throw new Error('No analytics data');
    console.log('   Total Reviews:', data.reviews.total);
    console.log('   Avg Rating:', data.rating.average);
    console.log('   Response Rate:', data.responses.rate + '%');
  });
  
  // Test 12: Rating Distribution
  await test('Rating Distribution', async () => {
    const data = await apiCall('/analytics/ratings');
    if (!data.distribution) throw new Error('No distribution data');
    console.log('   5 stars:', data.distribution[0].count, `(${data.distribution[0].percentage}%)`);
  });
  
  // Test 13: Platform Stats
  await test('Platform Stats', async () => {
    const data = await apiCall('/analytics/platforms');
    if (!data.platforms) throw new Error('No platform data');
    console.log('   Google:', data.platforms[0].reviews, 'reviews');
    console.log('   Meta:', data.platforms[1].reviews, 'reviews');
  });
  
  // Test 14: Google Status
  await test('Google Business Status', async () => {
    const data = await apiCall('/business/google/status');
    console.log('   Connected:', data.connected ? '✅' : '❌');
  });
  
  // Test 15: Meta Status
  await test('Meta Business Status', async () => {
    const data = await apiCall('/business/meta/status');
    console.log('   Connected:', data.connected ? '✅' : '❌');
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('\n🎉 All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
