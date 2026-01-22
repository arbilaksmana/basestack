# BaseStack - Use Case & Flow Diagrams

## 1. Use Case Diagram

```mermaid
graph TB
    subgraph "BaseStack System"
        UC1[🔐 Connect Wallet / Login]
        UC2[📋 Create Plan]
        UC3[📊 View Dashboard Metrics]
        UC4[📝 List Plans]
        UC5[🛒 View Checkout Page]
        UC6[💳 Subscribe to Plan]
        UC7[📜 View My Subscriptions]
        UC8[❌ Cancel Subscription]
        UC9[⚡ Auto Charge Subscription]
    end

    Merchant((👤 Merchant))
    Subscriber((👤 Subscriber))
    Keeper((🤖 Keeper Bot))

    Merchant --> UC1
    Merchant --> UC2
    Merchant --> UC3
    Merchant --> UC4

    Subscriber --> UC5
    Subscriber --> UC6
    Subscriber --> UC7
    Subscriber --> UC8

    Keeper --> UC9

    UC2 -.->|requires| UC1
    UC3 -.->|requires| UC1
    UC4 -.->|requires| UC1
    UC6 -.->|requires| UC5
```

## 2. Merchant Login Flow

```mermaid
sequenceDiagram
    participant M as Merchant
    participant F as Frontend
    participant W as Wallet (MetaMask)
    participant B as Backend API
    participant DB as Database

    M->>F: Click "Connect Wallet"
    F->>B: GET /api/auth/message
    B-->>F: Return auth message
    F->>W: Request signature
    W->>M: Show sign request
    M->>W: Approve & Sign
    W-->>F: Return signature
    F->>B: POST /api/auth/connect-wallet
    Note over B: {walletAddress, signature}
    B->>B: Verify signature with ethers.js
    alt Signature Valid
        B->>DB: Get or Create Merchant
        DB-->>B: Merchant record
        B->>B: Generate JWT Token
        B-->>F: {token, merchant}
        F->>F: Store token in localStorage
        F-->>M: Redirect to Dashboard
    else Signature Invalid
        B-->>F: Error: INVALID_SIGNATURE
        F-->>M: Show error message
    end
```

## 3. Create Plan Flow

```mermaid
sequenceDiagram
    participant M as Merchant
    participant F as Frontend
    participant B as Backend API
    participant DB as Database

    M->>F: Fill plan form
    Note over F: name, description,<br/>billingInterval,<br/>priceIdrx, priceUsdc, priceUsdt
    F->>B: POST /api/plans
    Note over F: Header: Authorization: Bearer {token}
    B->>B: Verify JWT Token
    alt Token Valid
        B->>B: Validate input
        B->>B: Generate slug
        B->>DB: INSERT plan
        DB-->>B: Plan created
        B-->>F: {success: true, data: plan}
        F-->>M: Show success, display plan
    else Token Invalid
        B-->>F: Error: INVALID_TOKEN (401)
        F-->>M: Redirect to login
    end
```

## 4. Subscriber Checkout Flow

```mermaid
sequenceDiagram
    participant S as Subscriber
    participant F as Frontend
    participant W as Wallet
    participant B as Backend API
    participant SC as Smart Contract
    participant DB as Database

    S->>F: Open checkout page
    F->>B: GET /api/checkout/{planSlug}
    B->>DB: Get plan by slug
    DB-->>B: Plan details
    B-->>F: Plan with prices
    F-->>S: Display plan & token options

    S->>F: Select token (USDC)
    S->>F: Click "Subscribe"
    F->>B: POST /api/checkout/{planId}/init
    Note over F: {walletAddress, selectedToken, country}
    B->>B: Validate token choice
    B->>DB: Get plan price
    B-->>F: {amount, contractAddress, planId}

    F->>W: Request approve token
    W->>S: Confirm approve
    S->>W: Approve
    W->>SC: approve(contractAddress, amount)
    SC-->>W: Approved

    F->>W: Request subscribe tx
    W->>S: Confirm transaction
    S->>W: Confirm
    W->>SC: subscribe(planId, token)
    SC-->>W: txHash

    F->>B: POST /api/checkout/{planId}/confirm
    Note over F: {walletAddress, selectedToken, txHash}
    B->>SC: Verify transaction
    SC-->>B: Transaction confirmed
    B->>DB: Create/Get Subscriber
    B->>DB: Create Subscription (status: active)
    DB-->>B: Subscription created
    B-->>F: {subscription, subscriber, plan}
    F-->>S: Show success page
```

## 5. Keeper Bot Billing Flow

```mermaid
sequenceDiagram
    participant K as Keeper Bot
    participant DB as Database
    participant SC as Smart Contract
    participant BC as Blockchain

    Note over K: Runs every hour (cron)
    K->>K: Start keeper job
    K->>DB: Query due subscriptions
    Note over DB: WHERE status='active'<br/>AND nextPayment <= NOW()
    DB-->>K: List of due subscriptions

    loop For each subscription
        K->>SC: chargeSubscription(userWallet, planId)
        SC->>BC: Execute charge
        alt Charge Success
            BC-->>SC: txHash
            SC-->>K: {success: true, txHash}
            K->>DB: Update nextPayment += billingInterval
            K->>DB: INSERT billingLog (status: success)
        else Charge Failed
            BC-->>SC: Error
            SC-->>K: {success: false, error}
            K->>DB: UPDATE subscription status = 'past_due'
            K->>DB: INSERT billingLog (status: failed, reason)
        end
        Note over K: Continue to next<br/>(no throw)
    end

    K->>K: Log summary
    Note over K: Processed: X, Success: Y, Failed: Z
```

## 6. Cancel Subscription Flow

```mermaid
sequenceDiagram
    participant S as Subscriber
    participant F as Frontend
    participant W as Wallet
    participant B as Backend API
    participant SC as Smart Contract
    participant DB as Database

    S->>F: View my subscriptions
    F->>B: GET /api/me/subscriptions?walletAddress=0x...
    B->>DB: Get subscriptions by wallet
    DB-->>B: Subscription list
    B-->>F: {subscriptions}
    F-->>S: Display subscriptions

    S->>F: Click "Cancel" on subscription
    F->>W: Request cancel tx (optional)
    W->>SC: cancelSubscription(subscriptionId)
    SC-->>W: txHash

    F->>B: POST /api/me/subscriptions/{id}/cancel
    Note over F: {walletAddress, txHash}
    B->>DB: Verify ownership
    B->>DB: UPDATE status = 'canceled'
    DB-->>B: Updated subscription
    B-->>F: {subscription}
    F-->>S: Show cancellation confirmed
```

## 7. Complete System Flow

```mermaid
flowchart TD
    subgraph Merchant["👤 Merchant Flow"]
        M1[Connect Wallet] --> M2[Create Plans]
        M2 --> M3[View Dashboard]
        M3 --> M4[Monitor Subscribers]
    end

    subgraph Subscriber["👤 Subscriber Flow"]
        S1[Browse Plans] --> S2[Select Plan & Token]
        S2 --> S3[Approve Token]
        S3 --> S4[Subscribe On-chain]
        S4 --> S5[Subscription Active]
        S5 --> S6{Continue?}
        S6 -->|Yes| S7[Auto-renewed by Keeper]
        S6 -->|No| S8[Cancel Subscription]
        S7 --> S5
    end

    subgraph Keeper["🤖 Keeper Bot"]
        K1[Cron Job Every Hour] --> K2[Query Due Subscriptions]
        K2 --> K3[Charge On-chain]
        K3 --> K4{Success?}
        K4 -->|Yes| K5[Update nextPayment]
        K4 -->|No| K6[Mark as past_due]
        K5 --> K7[Log Result]
        K6 --> K7
    end

    M2 -.->|Creates| Plans[(Plans DB)]
    S1 -.->|Reads| Plans
    S4 -.->|Creates| Subs[(Subscriptions DB)]
    K2 -.->|Reads| Subs
    K5 -.->|Updates| Subs
    K6 -.->|Updates| Subs
```

## 8. State Diagram - Subscription Status

```mermaid
stateDiagram-v2
    [*] --> active: Checkout Confirmed
    
    active --> active: Keeper charges successfully
    active --> past_due: Keeper charge failed
    active --> canceled: User cancels
    
    past_due --> active: Manual payment / Retry success
    past_due --> canceled: User cancels / Admin action
    
    canceled --> [*]
```

---


