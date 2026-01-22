const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper untuk API calls
async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  
  // Handle non-JSON responses
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data.data;
}

// Auth
export const getAuthMessage = () => request('GET', '/auth/message');
export const connectWallet = (walletAddress, signature) => 
  request('POST', '/auth/connect-wallet', { walletAddress, signature });

// Plans (merchant)
export const createPlan = (planData, token) => 
  request('POST', '/plans', planData, token);
export const getPlans = (token) => 
  request('GET', '/plans', null, token);

// Dashboard
export const getDashboardMetrics = (token) => 
  request('GET', '/dashboard/metrics', null, token);
export const getBillingLogs = (token) => 
  request('GET', '/dashboard/billing-logs', null, token);
export const getSubscribers = (token) => 
  request('GET', '/dashboard/subscribers', null, token);

// Merchant
export const getMerchantProfile = (token) => 
  request('GET', '/merchant/profile', null, token);
export const updateMerchantProfile = (data, token) => 
  request('PATCH', '/merchant/profile', data, token);

// Checkout
export const getPlanBySlug = (slug) => 
  request('GET', `/checkout/${slug}`);
export const initCheckout = (planId, data) => 
  request('POST', `/checkout/${planId}/init`, data);
export const confirmCheckout = (planId, data) => 
  request('POST', `/checkout/${planId}/confirm`, data);

// Subscriptions
export const getMySubscriptions = (walletAddress) => 
  request('GET', `/me/subscriptions?walletAddress=${walletAddress}`);
export const cancelSubscription = (id, data) => 
  request('POST', `/me/subscriptions/${id}/cancel`, data);

// Prices
export const getPrices = () => 
  request('GET', '/prices');
export const convertUsdToIdrx = (usd) => 
  request('GET', `/prices/convert?usd=${usd}`);
