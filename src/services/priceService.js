// Price service - fetch realtime crypto prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Cache prices for 60 seconds
let priceCache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 15000; // 15 seconds

// IDRX is pegged to IDR (Indonesian Rupiah)
// We'll fetch USD/IDR rate to calculate IDRX price
// Providers configuration
const PROVIDERS = [
  {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/prices/USD-IDR/spot',
    parser: (data) => parseFloat(data.data.amount)
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=idr',
    options: { headers: { 'User-Agent': 'BaseStack/1.0' } },
    parser: (data) => data['usd-coin']?.idr
  },
  {
    name: 'Frankfurter',
    url: 'https://api.frankfurter.app/latest?from=USD&to=IDR',
    parser: (data) => data.rates.IDR
  }
];

async function fetchPrices() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (priceCache.data && (now - priceCache.timestamp) < CACHE_TTL) {
    return priceCache.data;
  }
  
  let usdToIdr = 0;
  let providerName = '';

  // Try providers sequentially
  for (const provider of PROVIDERS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(provider.url, { 
        ...provider.options,
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      const data = await response.json();
      const price = provider.parser(data);
      
      if (price && !isNaN(price) && price > 0) {
        usdToIdr = price;
        providerName = provider.name;
        break; // Success
      }
    } catch (err) {
      console.warn(`[PriceService] ${provider.name} failed:`, err.message);
    }
  }

  // If all failed, check cache (even if expired) or use fallback
  if (usdToIdr === 0) {
    if (priceCache.data) {
      console.warn('[PriceService] All providers failed, using stale cache.');
      return priceCache.data;
    }
    console.error('[PriceService] CRITICAL: All providers failed, using hardcoded fallback.');
    usdToIdr = 16000;
  } else {
    console.log(`[PriceService] Updated price from ${providerName}: 1 USD = ${usdToIdr} IDR`);
  }
    
  // USD to IDR rate
  const prices = {
    USD_TO_IDR: usdToIdr,
    USDC_TO_USD: 1, // Stablecoin pegged to USD
    USDT_TO_USD: 1, // Stablecoin pegged to USD
    IDRX_TO_IDR: 1, // IDRX pegged to IDR
    updatedAt: new Date().toISOString(),
    source: providerName || 'fallback'
  };
  
  // Update cache
  priceCache = {
    data: prices,
    timestamp: now
  };
  
  return prices;
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
