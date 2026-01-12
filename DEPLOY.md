# BaseStack Deployment Guide

## Pre-Production Setup (Base Sepolia Testnet)

### 1. Deploy Smart Contracts to Base Sepolia

```bash
cd contracts

# Make sure you have ETH on Base Sepolia for gas
# Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# Deploy contracts
npx hardhat run scripts/deploy.js --network baseSepolia
```

Save the deployed contract addresses from the output.

### 2. Configure Environment

Copy `.env.production` and update with your values:

```bash
cp .env.production .env
```

Update these values in `.env`:
- `JWT_SECRET` - Generate a secure random string
- `PRIVATE_KEY` - Your deployer wallet private key (for keeper bot)
- `CONTRACT_ADDRESS` - SubscriptionManager address from deploy
- `TOKEN_IDRX` - IDRX token address from deploy
- `TOKEN_USDC` - USDC token address from deploy  
- `TOKEN_USDT` - USDT token address from deploy

### 3. Build Frontend

```bash
cd frontend
npm install
npm run build
```

### 4. Start Production Server

```bash
# From root directory
npm install
npm run start:prod
```

Server will serve both API and frontend on port 3000.

### 5. Start Keeper Bot (separate process)

```bash
npm run keeper:prod
```

## Production Checklist

- [ ] Generate secure JWT_SECRET (min 32 characters)
- [ ] Use production private key (not test key)
- [ ] Deploy contracts to Base Sepolia
- [ ] Update all contract addresses in .env
- [ ] Build frontend with production config
- [ ] Set up process manager (PM2) for server and keeper
- [ ] Configure reverse proxy (nginx) with SSL
- [ ] Set up database backups

## Hosting Options

### Option A: VPS (DigitalOcean, AWS EC2, etc.)

1. SSH into server
2. Install Node.js 18+
3. Clone repository
4. Follow steps above
5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start src/server.js --name basestack-api
pm2 start src/keeper.js --name basestack-keeper
pm2 save
pm2 startup
```

### Option B: Railway/Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Option C: Vercel (Frontend) + Railway (Backend)

1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update VITE_API_URL in frontend

## Base Sepolia Network Info

- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Block Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Troubleshooting

### Contract deployment fails
- Check you have enough ETH for gas
- Verify RPC_URL is correct
- Check PRIVATE_KEY format (with or without 0x prefix)

### Frontend can't connect to API
- Check CORS settings
- Verify API URL in frontend .env
- Check network tab for actual requests

### Keeper bot not charging subscriptions
- Verify PRIVATE_KEY has enough ETH for gas
- Check CONTRACT_ADDRESS is correct
- Verify keeper address is set in contract
