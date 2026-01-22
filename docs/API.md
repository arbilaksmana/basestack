# BaseStack API Documentation

Base URL: `http://43.228.214.222:3000/api`

## Authentication

### Get Auth Message
```
GET /auth/message
```
Response:
```json
{
  "success": true,
  "data": {
    "message": "Sign this message to authenticate with BaseStack: [timestamp]"
  }
}
```

### Connect Wallet
```
POST /auth/connect-wallet
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "merchant": {
      "id": 1,
      "walletAddress": "0x...",
      "name": null
    }
  }
}
```

---

## Plans (Requires Auth)

### Create Plan
```
POST /plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pro Plan",
  "description": "Premium features",
  "billingInterval": 2592000,
  "priceIdrx": 150000,
  "priceUsdc": 10000000,
  "priceUsdt": 10000000
}
```

### List Plans
```
GET /plans
Authorization: Bearer <token>
```

### Update Plan
```
PATCH /plans/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive"
}
```

---

## Dashboard (Requires Auth)

### Get Metrics
```
GET /dashboard/metrics
Authorization: Bearer <token>
```
Response:
```json
{
  "success": true,
  "data": {
    "activeCount": 10,
    "pastDueCount": 2,
    "mrr": 100000000,
    "totalSubscribers": 15
  }
}
```

### Get Billing Logs
```
GET /dashboard/billing-logs
Authorization: Bearer <token>
```

### Get Subscribers
```
GET /dashboard/subscribers
Authorization: Bearer <token>
```

---

## Checkout (Public)

### Get Plan by Slug
```
GET /checkout/:planSlug
```
Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pro Plan",
    "slug": "pro-plan",
    "description": "...",
    "billingInterval": 2592000,
    "prices": {
      "IDRX": 150000,
      "USDC": 10000000,
      "USDT": 10000000
    }
  }
}
```

### Initialize Checkout
```
POST /checkout/:planId/init
Content-Type: application/json

{
  "walletAddress": "0x...",
  "selectedToken": "USDC",
  "country": "ID"
}
```

### Confirm Checkout
```
POST /checkout/:planId/confirm
Content-Type: application/json

{
  "walletAddress": "0x...",
  "selectedToken": "USDC",
  "txHash": "0x..."
}
```

---

## Subscriptions (Public)

### Get My Subscriptions
```
GET /me/subscriptions?walletAddress=0x...
```

### Cancel Subscription
```
POST /me/subscriptions/:id/cancel
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

---

## Merchant (Requires Auth)

### Get Profile
```
GET /merchant/profile
Authorization: Bearer <token>
```

### Update Profile
```
PATCH /merchant/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Business"
}
```

---

## Prices (Public)

### Get Exchange Rates
```
GET /prices
```
Response:
```json
{
  "success": true,
  "data": {
    "USD_TO_IDR": 16000,
    "USDC_TO_USD": 1,
    "USDT_TO_USD": 1,
    "IDRX_TO_IDR": 1,
    "updatedAt": "2025-01-12T..."
  }
}
```

### Convert USD to IDRX
```
GET /prices/convert?usd=10
```

---

## Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T..."
}
```

---

## Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Token Decimals
- USDC: 6 decimals (10 USDC = 10000000)
- USDT: 6 decimals (10 USDT = 10000000)
- IDRX: 0 decimals (150000 IDRX = 150000)

## Billing Interval
- Weekly: 604800 seconds
- Monthly: 2592000 seconds
- Quarterly: 7776000 seconds
- Yearly: 31536000 seconds
