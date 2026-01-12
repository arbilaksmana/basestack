require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: '7d'
  },
  
  database: {
    path: process.env.DATABASE_PATH || './db/database.sqlite'
  },
  
  blockchain: {
    rpcUrl: process.env.RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS
  },
  
  tokens: {
    IDRX: process.env.TOKEN_IDRX,
    USDC: process.env.TOKEN_USDC,
    USDT: process.env.TOKEN_USDT
  },
  
  // Valid pay tokens
  validPayTokens: ['IDRX', 'USDC', 'USDT']
};
