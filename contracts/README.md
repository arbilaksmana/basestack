# BaseStack Smart Contracts

## Setup

```bash
cd contracts
npm install
```

## Deploy to Local (Hardhat)

```bash
npm run deploy:local
```

## Deploy to Base Sepolia Testnet

1. Get testnet ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

2. Update `.env` in root folder:
```env
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=0x_your_private_key
```

3. Deploy:
```bash
npm run deploy:testnet
```

4. Copy the output addresses to your `.env`:
```env
CONTRACT_ADDRESS=0x...
TOKEN_IDRX=0x...
TOKEN_USDC=0x...
TOKEN_USDT=0x...
```

## Contract Functions

### For Merchants
- `createPlan(priceIdrx, priceUsdc, priceUsdt, billingInterval)` - Create subscription plan
- `deactivatePlan(planId)` - Deactivate a plan

### For Subscribers
- `subscribe(planId, tokenAddress)` - Subscribe to a plan
- `cancelSubscription(planId)` - Cancel subscription

### For Keeper Bot
- `chargeSubscription(userAddress, planId)` - Charge due subscription

### View Functions
- `getPlan(planId)` - Get plan details
- `getSubscription(user, planId)` - Get subscription details
