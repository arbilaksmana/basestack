**BaseStack API Documentation**

_Web3 Payment Gateway Subscription Backend_

Generated: 11/1/2026

# Daftar Isi

1\. Overview

2\. Tech Stack

3\. API Endpoints

4\. Error Codes

5\. Database Schema

6\. Test Results

# 1\. Overview

Backend API untuk subscription payment gateway berbasis Web3. Mendukung pembayaran recurring dengan token IDRX, USDC, dan USDT di Base network.

**Fitur Utama:**

• Merchant authentication dengan wallet signature

• Subscription plan management

• Multi-token payment (IDRX, USDC, USDT)

• Automated billing dengan Keeper Bot

• Dashboard metrics untuk merchant

# 2\. Tech Stack

| **Technology** | **Version** | **Purpose** |
| --- | --- | --- |
| Node.js | \>= 18.0.0 | Runtime environment |
| Express.js | 4.18.x | Web framework |
| SQLite3 | better-sqlite3 | Database |
| ethers.js | 6.x | Blockchain interaction |
| JWT | jsonwebtoken | Authentication |

# 3\. API Endpoints

Base URL: <http://localhost:3000>

## 3.1 Authentication

**GET /api/auth/message**

Description: Get message untuk di-sign oleh wallet

Authentication: No

**Response:**

{

"success": true,

"data": {

"message": "Sign this message to authenticate with BaseStack"

}

}

**POST /api/auth/connect-wallet**

Description: Authenticate merchant dengan wallet signature

Authentication: No

**Request:**

{

"walletAddress": "0x...",

"signature": "0x..."

}

**Response:**

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

## 3.2 Plans

**POST /api/plans**

Description: Create subscription plan

Authentication: Yes (JWT)

**Request:**

{

"name": "Pro Plan",

"description": "Access to all features",

"billingInterval": 2592000,

"priceIdrx": 150000,

"priceUsdc": 10000000,

"priceUsdt": 10000000

}

**Response:**

{

"success": true,

"data": {

"id": 1,

"merchantId": 1,

"name": "Pro Plan",

"slug": "pro-plan-abc123",

"status": "active",

...

}

}

**GET /api/plans**

Description: List semua plan milik merchant

Authentication: Yes (JWT)

**Response:**

{

"success": true,

"data": \[

{ "id": 1, "name": "Pro Plan", ... }

\]

}

## 3.3 Dashboard

**GET /api/dashboard/metrics**

Description: Get merchant dashboard metrics

Authentication: Yes (JWT)

**Response:**

{

"success": true,

"data": {

"activeCount": 150,

"pastDueCount": 5,

"mrr": 1500000000,

"totalSubscribers": 160

}

}

## 3.4 Checkout

**GET /api/checkout/:planSlug**

Description: Get plan details untuk checkout page

Authentication: No

**Response:**

{

"success": true,

"data": {

"id": 1,

"name": "Pro Plan",

"prices": {

"IDRX": 150000,

"USDC": 10000000,

"USDT": 10000000

}

}

}

**POST /api/checkout/:planId/init**

Description: Initialize checkout - get payment info

Authentication: No

**Request:**

{

"walletAddress": "0x...",

"selectedToken": "USDC",

"country": "ID"

}

**Response:**

{

"success": true,

"data": {

"planId": 1,

"amount": 10000000,

"selectedToken": "USDC",

"contractAddress": "0x..."

}

}

**POST /api/checkout/:planId/confirm**

Description: Confirm checkout setelah payment on-chain

Authentication: No

**Request:**

{

"walletAddress": "0x...",

"selectedToken": "USDC",

"txHash": "0x..."

}

**Response:**

{

"success": true,

"data": {

"subscription": { ... },

"subscriber": { ... },

"plan": { ... }

}

}

## 3.5 Subscription Management

**GET /api/me/subscriptions**

Description: List subscriptions untuk wallet address

Authentication: No

**Request:**

Query: ?walletAddress=0x...

**Response:**

{

"success": true,

"data": \[

{

"id": 1,

"planName": "Pro Plan",

"status": "active",

...

}

\]

}

**POST /api/me/subscriptions/:id/cancel**

Description: Cancel subscription

Authentication: No

**Request:**

{

"walletAddress": "0x...",

"txHash": "0x..."

}

**Response:**

{

"success": true,

"data": {

"id": 1,

"status": "canceled",

...

}

}

# 4\. Error Codes

| **Code** | **Description** |
| --- | --- |
| INVALID_SIGNATURE | Wallet signature verification failed |
| INVALID_TOKEN | JWT token invalid or expired |
| PLAN_NOT_FOUND | Plan does not exist |
| INVALID_PAY_TOKEN | Selected token not supported (must be IDRX/USDC/USDT) |
| TX_VERIFICATION_FAILED | On-chain transaction verification failed |
| SUBSCRIPTION_NOT_FOUND | Subscription does not exist |
| VALIDATION_ERROR | Request validation failed |
| SERVER_ERROR | Internal server error |

**Standard Error Response Format:**

{

"success": false,

"error": {

"message": "Human readable message",

"code": "ERROR_CODE"

}

}

# 5\. Database Schema

### 5.1 merchants

| **Column** | **Type** | **Constraints** |
| --- | --- | --- |
| id  | INTEGER | PRIMARY KEY |
| walletAddress | TEXT | UNIQUE NOT NULL |
| name | TEXT |     |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 5.2 plans

| **Column** | **Type** | **Constraints** |
| --- | --- | --- |
| id  | INTEGER | PRIMARY KEY |
| merchantId | INTEGER | FOREIGN KEY |
| name | TEXT | NOT NULL |
| slug | TEXT | UNIQUE |
| billingInterval | INTEGER | NOT NULL (seconds) |
| priceIdrx | INTEGER | NOT NULL |
| priceUsdc | INTEGER | NOT NULL |
| priceUsdt | INTEGER | NOT NULL |
| status | TEXT | DEFAULT active |

### 5.3 subscribers

| **Column** | **Type** | **Constraints** |
| --- | --- | --- |
| id  | INTEGER | PRIMARY KEY |
| walletAddress | TEXT | UNIQUE NOT NULL |
| country | TEXT |     |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 5.4 subscriptions

| **Column** | **Type** | **Constraints** |
| --- | --- | --- |
| id  | INTEGER | PRIMARY KEY |
| subscriberId | INTEGER | FOREIGN KEY |
| planId | INTEGER | FOREIGN KEY |
| payToken | TEXT | NOT NULL (IDRX/USDC/USDT) |
| amount | INTEGER | NOT NULL |
| nextPayment | TIMESTAMP | NOT NULL |
| status | TEXT | DEFAULT active |

### 5.5 billingLogs

| **Column** | **Type** | **Constraints** |
| --- | --- | --- |
| id  | INTEGER | PRIMARY KEY |
| subscriptionId | INTEGER | FOREIGN KEY |
| txHash | TEXT |     |
| status | TEXT | NOT NULL (success/failed) |
| reason | TEXT |     |

# 6\. Test Results

Test Date: 11/1/2026

Total Tests: 12 | Passed: 12 | Failed: 0

| **No** | **Test Name** | **Endpoint** | **Expected** | **Result** |
| --- | --- | --- | --- | --- |
| 1   | Health Check | GET /health | status: ok | PASS |
| 2   | Get Auth Message | GET /api/auth/message | Return auth message | PASS |
| 3   | Connect Wallet | POST /api/auth/connect-wallet | Return JWT token | PASS |
| 4   | Create Plan | POST /api/plans | Create plan, return ID | PASS |
| 5   | List Plans | GET /api/plans | Return plan array | PASS |
| 6   | Get Plan by Slug | GET /api/checkout/:slug | Return plan details | PASS |
| 7   | Init Checkout | POST /api/checkout/:id/init | Return payment info | PASS |
| 8   | Invalid Token Validation | POST /api/checkout/:id/init | Return validation error | PASS |
| 9   | Dashboard Metrics | GET /api/dashboard/metrics | Return metrics object | PASS |
| 10  | List Subscriptions | GET /api/me/subscriptions | Return subscription array | PASS |
| 11  | Auth Protection | POST /api/plans (no token) | Return 401 Unauthorized | PASS |
| 12  | 404 Handler | GET /api/nonexistent | Return 404 Not Found | PASS |

**✅ All tests passed successfully!**