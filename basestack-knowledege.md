# BaseStack  
**Base Indonesia Hackathon 2025**

---

## 1. Project Overview

**BaseStack** adalah infrastruktur pembayaran berulang (*recurring payment*) di jaringan **Base**. Aplikasi ini mengubah model pembayaran kripto manual (*Manual Push*) menjadi otomatis (*Auto-Debit*) menggunakan pola arsitektur **Keeper Network**.

### Hackathon Alignment (Base Track)
- **Target Track:** Base Track – *Elevating Onchain UX*
- **Problem Solved:**
  - Complex DeFi processes
  - Poor onboarding dalam pembayaran langganan
- **IDRX Integration:**  
  Mengincar **Best Project IDRX Bonus** dengan menjadikan **IDRX** sebagai mata uang utama untuk merchant lokal Indonesia.
- **Mini-App Ready:**  
  UI mobile-first untuk pengalaman pengguna ritel yang seamless.

### Value Proposition Utama
- **Glocal Pricing:**  
  Satu plan langganan memiliki dua harga:
  - Lokal: **IDRX**
  - Global: **USDC**
- **Auto-Debit:**  
  Menggunakan **Keeper Bot** untuk otomatisasi, menghilangkan friksi pembayaran bulanan manual.
- **Trustless:**  
  Dana mengalir **P2P** dari User ke Merchant, kontrak **tidak menahan dana**.

---

## 2. Tech Stack (Hackathon Compliant)

- **Blockchain:** Base Mainnet / Sepolia  
- **Smart Contracts:** Solidity (Hardhat / Foundry)  
- **Frontend:** Next.js, Tailwind CSS  
- **Wallet & UX:** `@coinbase/onchainkit` *(wajib)*  
- **Backend:** Node.js (v18+), Express.js  
- **Database:** SQLite3 (`better-sqlite3`)  
- **Automation:** Node.js Cron Job (Keeper Bot)

---

## 3. Database Schema

> Referensi tunggal untuk Model / Migration

### merchants
- `id` (PK)  
- `walletAddress` (Unique)  
- `name`  
- `createdAt`

### plans
- `id` (PK)  
- `merchantId` (FK)  
- `name`  
- `slug` (Unique)  
- `billingInterval` (seconds)  
- `priceIdrx` (INT)  
- `priceUsdc` (INT)  
- `status`

### subscribers
- `id` (PK)  
- `walletAddress` (Unique)  
- `country` (Detected by IP)  
- `createdAt`

### subscriptions
- `id` (PK)  
- `subscriberId` (FK)  
- `planId` (FK)  
- `payToken` (TEXT: `IDRX` / `USDC`)  
- `amount` (INT)  
- `nextPayment` (TIMESTAMP)  
- `status`

### billingLogs
- `id` (PK)  
- `subscriptionId` (FK)  
- `txHash`  
- `status` (`success` / `failed`)  
- `reason`

---

## 4. Smart Contract Specifications

### Subscription Logic
- `subscribe(planId, token)`  
  Menyimpan data subscriber **on-chain**.
- `chargeSubscription(subscriberId)`  
  Hanya bisa dipanggil oleh **Keeper**.
- **Logic:**  
  `nextPayment += interval` setelah pembayaran sukses.

### Safety & UX
- Gunakan `try/catch` di dalam loop `charge` untuk mencegah kegagalan massal.
- Return `bool success`, **jangan revert seluruh blok**.

### Token Support
- **Whitelist Token Address:**
  - IDRX *(wajib untuk lomba)*
  - USDC

---

## 5. API Endpoints

### Authentication
- `GET /api/auth/message`  
  Get message to sign
- `POST /api/auth/connect-wallet`  
  Verify signature & return JWT

### Plans (Merchant)
- `POST /api/plans`  
  Create plan dengan dual pricing (`priceIdrx`, `priceUsdc`)
- `GET /api/plans`  
  List merchant plans

### Checkout (Public / User)
- `GET /api/checkout/:planSlug`  
  Get plan details & pricing
- `POST /api/checkout/:planId/init`  
  Init checkout session
- `POST /api/checkout/:planId/confirm`  
  Confirm payment & activate subscription

### Subscription Management
- `GET /api/me/subscriptions`  
  List active subscriptions
- `POST /api/me/subscriptions/:id/cancel`  
  Record cancellation setelah on-chain `revokeAllowance`

---

## 6. Frontend & UI Rules (Base Mini-App Standard)

### A. General UX
- **Mobile First:**  
  Layout optimal untuk layar HP (*Mini-App style*).
- **OnchainKit Components:**  
  Gunakan:
  - `<WalletWrapper>`
  - `<Identity>`
  - `<Transaction>`

### B. Merchant Dashboard
- **Revenue Stats:**  
  Split revenue **IDRX vs USDC**.
- **Create Plan Modal:**
  - Input IDRX → auto-calc ke USDC
  - Tampilkan logo **IDRX** secara jelas

### C. Checkout Page (User)
- **Smart Default:**
  - IP Indonesia → auto-select **IDRX**
  - IP Global → auto-select **USDC**
- **Currency Switcher:** Toggle IDRX / USDC
- **Checkout Button:**  
  Teks dinamis:
  - *Subscribe with IDRX*
  - *Subscribe with USDC*

### D. Subscriber Dashboard
- List kartu langganan
- Tombol **Cancel (Unsubscribe)** → trigger transaksi on-chain `revokeAllowance`

---

## 7. Submission Checklist  
**Deadline: Jan 31, 2026**

- [ ] Functional MVP (end-to-end subscription di Base)
- [ ] Deployed (Smart Contract + Frontend)
  - Frontend: Vercel
  - Contract: Base Mainnet / Sepolia
- [ ] Public GitHub Repository
- [ ] Demo Video (min. 1 menit)
  - Intro → Problem → Solution → Demo (Sari & Mike)
- [ ] **IDRX Integration** berfungsi & disorot di video

---

## Instruksi Khusus untuk AI (Prompt System)

- **Coding Style:** TypeScript `strict` mode
- **Library Priority:** `@coinbase/onchainkit`
- **Deployment Ready:**  
  - Frontend → Vercel  
  - Contract → Base
- **Focus Utama Penilaian:**  
  - IDRX Integration  
  - Recurring Billing
