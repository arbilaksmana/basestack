/**
 * API Integration Test Script
 * Run: node test/api-test.js
 * 
 * Pastikan server sudah running: npm start
 */

const { ethers } = require('ethers');

const BASE_URL = 'http://localhost:3000';

// Test wallet (random untuk testing)
const testWallet = ethers.Wallet.createRandom();
const AUTH_MESSAGE = 'Sign this message to authenticate with BaseStack';

// Helper untuk HTTP requests
async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

// Test results tracker
const results = { passed: 0, failed: 0, tests: [] };

function log(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
  results.tests.push({ name, passed });
  if (passed) results.passed++; else results.failed++;
}

async function runTests() {
  console.log('\n🚀 Starting API Tests...\n');
  console.log(`Test Wallet: ${testWallet.address}\n`);
  
  let merchantToken = null;
  let planId = null;
  let planSlug = null;
  let subscriptionId = null;

  // ========== 1. Health Check ==========
  try {
    const { status, data } = await request('GET', '/health');
    log('Health Check', status === 200 && data.status === 'ok');
  } catch (e) {
    log('Health Check', false, e.message);
  }

  // ========== 2. Get Auth Message ==========
  try {
    const { status, data } = await request('GET', '/api/auth/message');
    log('Get Auth Message', status === 200 && data.success && data.data.message === AUTH_MESSAGE);
  } catch (e) {
    log('Get Auth Message', false, e.message);
  }

  // ========== 3. Connect Wallet (Auth) ==========
  try {
    const signature = await testWallet.signMessage(AUTH_MESSAGE);
    const { status, data } = await request('POST', '/api/auth/connect-wallet', {
      walletAddress: testWallet.address,
      signature
    });
    
    if (data.success && data.data.token) {
      merchantToken = data.data.token;
      log('Connect Wallet', true, `Token received`);
    } else {
      log('Connect Wallet', false, data.error?.message);
    }
  } catch (e) {
    log('Connect Wallet', false, e.message);
  }

  // ========== 4. Create Plan (Protected) ==========
  try {
    const { status, data } = await request('POST', '/api/plans', {
      name: 'Test Pro Plan',
      description: 'Monthly subscription for testing',
      billingInterval: 2592000, // 30 days
      priceIdrx: 150000,
      priceUsdc: 10000000,
      priceUsdt: 10000000
    }, merchantToken);
    
    if (data.success && data.data.id) {
      planId = data.data.id;
      planSlug = data.data.slug;
      log('Create Plan', true, `Plan ID: ${planId}, Slug: ${planSlug}`);
    } else {
      log('Create Plan', false, data.error?.message);
    }
  } catch (e) {
    log('Create Plan', false, e.message);
  }

  // ========== 5. List Plans ==========
  try {
    const { status, data } = await request('GET', '/api/plans', null, merchantToken);
    log('List Plans', data.success && Array.isArray(data.data) && data.data.length > 0, 
        `Found ${data.data?.length || 0} plans`);
  } catch (e) {
    log('List Plans', false, e.message);
  }

  // ========== 6. Get Plan by Slug (Checkout) ==========
  try {
    const { status, data } = await request('GET', `/api/checkout/${planSlug}`);
    log('Get Plan by Slug', data.success && data.data.id === planId, 
        `Plan: ${data.data?.name}`);
  } catch (e) {
    log('Get Plan by Slug', false, e.message);
  }

  // ========== 7. Init Checkout ==========
  try {
    const subscriberWallet = ethers.Wallet.createRandom();
    const { status, data } = await request('POST', `/api/checkout/${planId}/init`, {
      walletAddress: subscriberWallet.address,
      selectedToken: 'USDC',
      country: 'ID'
    });
    
    log('Init Checkout', data.success && data.data.amount === 10000000, 
        `Amount: ${data.data?.amount} ${data.data?.selectedToken}`);
  } catch (e) {
    log('Init Checkout', false, e.message);
  }

  // ========== 8. Invalid Token Checkout ==========
  try {
    const { status, data } = await request('POST', `/api/checkout/${planId}/init`, {
      walletAddress: '0x1234',
      selectedToken: 'INVALID',
      country: 'ID'
    });
    
    log('Invalid Token Validation', !data.success && data.error?.code === 'VALIDATION_ERROR');
  } catch (e) {
    log('Invalid Token Validation', false, e.message);
  }

  // ========== 9. Dashboard Metrics ==========
  try {
    const { status, data } = await request('GET', '/api/dashboard/metrics', null, merchantToken);
    log('Dashboard Metrics', data.success && 
        typeof data.data.activeCount === 'number' &&
        typeof data.data.pastDueCount === 'number' &&
        typeof data.data.mrr === 'number',
        `Active: ${data.data?.activeCount}, MRR: ${data.data?.mrr}`);
  } catch (e) {
    log('Dashboard Metrics', false, e.message);
  }

  // ========== 10. List Subscriptions (Empty) ==========
  try {
    const { status, data } = await request('GET', `/api/me/subscriptions?walletAddress=${testWallet.address}`);
    log('List Subscriptions', data.success && Array.isArray(data.data), 
        `Found ${data.data?.length || 0} subscriptions`);
  } catch (e) {
    log('List Subscriptions', false, e.message);
  }

  // ========== 11. Protected Route Without Token ==========
  try {
    const { status, data } = await request('POST', '/api/plans', { name: 'Test' });
    log('Auth Protection', status === 401 && data.error?.code === 'INVALID_TOKEN');
  } catch (e) {
    log('Auth Protection', false, e.message);
  }

  // ========== 12. 404 Handler ==========
  try {
    const { status, data } = await request('GET', '/api/nonexistent');
    log('404 Handler', status === 404 && data.error?.code === 'NOT_FOUND');
  } catch (e) {
    log('404 Handler', false, e.message);
  }

  // ========== Summary ==========
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${results.passed}/${results.passed + results.failed} passed`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => console.log(`   - ${t.name}`));
  }
  
  console.log('='.repeat(50) + '\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
