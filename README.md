# BaseStack - Web3 Payment Gateway Subscription

Backend API untuk subscription payment gateway berbasis Web3. Mendukung pembayaran recurring dengan token IDRX, USDC, dan USDT di Base network.

## Tech Stack

- Express.js (Node.js)
- SQLite3 (better-sqlite3)
- ethers.js v6
- JWT Authentication

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi yang sesuai

# Initialize database
npm run db:init

# Start server
npm start

# Run keeper bot (billing automation)
npm run keeper
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_PATH=./db/database.sqlite
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=keeper-wallet-private-key
CONTRACT_ADDRESS=0x_subscription_contract
TOKEN_IDRX=0x_idrx_address
TOKEN_USDC=0x_usdc_address
TOKEN_USDT=0x_usdt_address
```

## API Endpoints

### Authentication

#### GET /api/auth/message
Get message untuk di-sign oleh wallet.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Sign this message to authenticate with BaseStack"
  }
}
```

#### POST /api/auth/connect-wallet
Authenticate merchant dengan wallet signature.

**Request:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

**Response:**
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

### Plans (Requires Auth)

#### POST /api/plans
Create subscription plan.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Pro Plan",
  "description": "Access to all features",
  "billingInterval": 2592000,
  "priceIdrx": 150000,
  "priceUsdc": 10000000,
  "priceUsdt": 10000000
}
```

> Note: `billingInterval` dalam detik (2592000 = 30 hari), harga dalam smallest unit token

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "merchantId": 1,
    "name": "Pro Plan",
    "slug": "pro-plan-abc123",
    "description": "Access to all features",
    "billingInterval": 2592000,
    "priceIdrx": 150000,
    "priceUsdc": 10000000,
    "priceUsdt": 10000000,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/plans
List semua plan milik merchant.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pro Plan",
      "slug": "pro-plan-abc123",
      ...
    }
  ]
}
```

---

### Dashboard (Requires Auth)

#### GET /api/dashboard/metrics
Get merchant dashboard metrics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "activeCount": 150,
    "pastDueCount": 5,
    "mrr": 1500000000,
    "totalSubscribers": 160
  }
}
```

---

### Checkout (Public)

#### GET /api/checkout/:planSlug
Get plan details untuk checkout page.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pro Plan",
    "slug": "pro-plan-abc123",
    "description": "Access to all features",
    "billingInterval": 2592000,
    "prices": {
      "IDRX": 150000,
      "USDC": 10000000,
      "USDT": 10000000
    }
  }
}
```

#### POST /api/checkout/:planId/init
Initialize checkout - get payment info.

**Request:**
```json
{
  "walletAddress": "0x...",
  "selectedToken": "USDC",
  "country": "ID"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "planId": 1,
    "planName": "Pro Plan",
    "amount": 10000000,
    "selectedToken": "USDC",
    "tokenAddress": "0x...",
    "contractAddress": "0x...",
    "billingInterval": 2592000
  }
}
```

#### POST /api/checkout/:planId/confirm
Confirm checkout setelah payment on-chain.

**Request:**
```json
{
  "walletAddress": "0x...",
  "selectedToken": "USDC",
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "subscriberId": 1,
      "planId": 1,
      "payToken": "USDC",
      "amount": 10000000,
      "nextPayment": "2024-02-01T00:00:00.000Z",
      "status": "active"
    },
    "subscriber": {...},
    "plan": {...}
  }
}
```

---

### Subscription Management (Public)

#### GET /api/me/subscriptions?walletAddress=0x...
List subscriptions untuk wallet address.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "planId": 1,
      "planName": "Pro Plan",
      "payToken": "USDC",
      "amount": 10000000,
      "nextPayment": "2024-02-01T00:00:00.000Z",
      "status": "active"
    }
  ]
}
```

#### POST /api/me/subscriptions/:id/cancel
Cancel subscription.

**Request:**
```json
{
  "walletAddress": "0x...",
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "canceled",
    ...
  }
}
```

---

## Keeper Bot

Worker script untuk auto-billing subscriptions yang sudah jatuh tempo.

```bash
# Run manually
npm run keeper

# Setup cron (setiap jam)
0 * * * * cd /path/to/project && npm run keeper >> /var/log/keeper.log 2>&1
```

**Flow:**
1. Query subscriptions WHERE status='active' AND nextPayment <= NOW()
2. Untuk setiap subscription:
   - Call `chargeSubscription(userWallet, planId)` on smart contract
   - Jika sukses: update nextPayment, log success
   - Jika gagal: set status='past_due', log failure
3. Continue ke subscription berikutnya (tidak throw error)

---

## Database Schema

```sql
-- merchants
CREATE TABLE merchants (
  id INTEGER PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  name TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- plans
CREATE TABLE plans (
  id INTEGER PRIMARY KEY,
  merchantId INTEGER NOT NULL,
  onchainPlanId INTEGER,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  billingInterval INTEGER NOT NULL,
  priceIdrx INTEGER NOT NULL,
  priceUsdc INTEGER NOT NULL,
  priceUsdt INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- subscribers
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  country TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- subscriptions
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY,
  subscriberId INTEGER NOT NULL,
  planId INTEGER NOT NULL,
  payToken TEXT NOT NULL,
  amount INTEGER NOT NULL,
  nextPayment TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- billingLogs
CREATE TABLE billingLogs (
  id INTEGER PRIMARY KEY,
  subscriptionId INTEGER NOT NULL,
  txHash TEXT,
  status TEXT NOT NULL,
  reason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_SIGNATURE | Wallet signature verification failed |
| INVALID_TOKEN | JWT token invalid or expired |
| PLAN_NOT_FOUND | Plan does not exist |
| INVALID_PAY_TOKEN | Selected token not supported |
| TX_VERIFICATION_FAILED | On-chain transaction verification failed |
| SUBSCRIPTION_NOT_FOUND | Subscription does not exist |
| VALIDATION_ERROR | Request validation failed |
| SERVER_ERROR | Internal server error |

---

## Project Structure

```
basestack-backend/
├── package.json
├── .env.example
├── README.md
├── db/
│   ├── init.js
│   └── database.sqlite
└── src/
    ├── server.js
    ├── keeper.js
    ├── config/index.js
    ├── middleware/auth.js
    ├── services/
    │   ├── authService.js
    │   ├── planService.js
    │   ├── checkoutService.js
    │   ├── subscriptionService.js
    │   └── keeperService.js
    ├── routes/
    │   ├── auth.js
    │   ├── plans.js
    │   ├── dashboard.js
    │   ├── checkout.js
    │   └── subscriptions.js
    └── utils/
        ├── db.js
        ├── contract.js
        └── response.js
```

---

## License

MIT
