// Price service - fetch realtime crypto prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Cache prices for 60 seconds
let priceCache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 60000; // 60 seconds

// IDRX is pegged to IDR (Indonesian Rupiah)
// We'll fetch USD/IDR rate to calculate IDRX price
async function fetchPrices() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (priceCache.data && (now - priceCache.timestamp) < CACHE_TTL) {
    return priceCache.data;
  }
  
  try {
    // Fetch USD to IDR rate
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=usd&vs_currencies=idr`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data = await response.json();
    
    // USD to IDR rate (approximately 15,500-16,500)
    const usdToIdr = data.usd?.idr || 16000;
    
    const prices = {
      USD_TO_IDR: usdToIdr,
      USDC_TO_USD: 1, // Stablecoin pegged to USD
      USDT_TO_USD: 1, // Stablecoin pegged to USD
      IDRX_TO_IDR: 1, // IDRX pegged to IDR
      updatedAt: new Date().toISOString()
    };
    
    // Update cache
    priceCache = {
      data: prices,
      timestamp: now
    };
    
    return prices;
  } catch (err) {
    console.error('[PriceService] Error fetching prices:', err.message);
    
    // Return fallback prices if API fails
    return {
      USD_TO_IDR: 16000,
      USDC_TO_USD: 1,
      USDT_TO_USD: 1,
      IDRX_TO_IDR: 1,
      updatedAt: new Date().toISOString(),
      isFallback: true
    };
  }
}

// Convert USD to IDRX amount
async function usdToIdrx(usdAmount) {
  const prices = await fetchPrices();
  return Math.round(usdAmount * prices.USD_TO_IDR);
}

// Convert IDRX to USD amount
async function idrxToUsd(idrxAmount) {
  const prices = await fetchPrices();
  return idrxAmount / prices.USD_TO_IDR;
}

// Get all conversion rates
async function getRates() {
  return await fetchPrices();
}

module.exports = {
  fetchPrices,
  usdToIdrx,
  idrxToUsd,
  getRates
};
