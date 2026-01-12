const jwt = require('jsonwebtoken');
const config = require('../config');
const { run, get } = require('../utils/db');
const { verifySignature } = require('../utils/contract');

// Standard message for wallet signature
const AUTH_MESSAGE = 'Sign this message to authenticate with BaseStack';

// Verify wallet signature
function verifyWalletSignature(walletAddress, signature) {
  return verifySignature(walletAddress, signature, AUTH_MESSAGE);
}

// Generate JWT token for merchant
function generateToken(merchant) {
  return jwt.sign(
    { 
      id: merchant.id, 
      walletAddress: merchant.walletAddress 
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return null;
  }
}

// Get or create merchant by wallet address
function getOrCreateMerchant(walletAddress) {
  const normalizedAddress = walletAddress.toLowerCase();
  
  // Try to find existing merchant
  let merchant = get(
    'SELECT * FROM merchants WHERE LOWER(walletAddress) = ?',
    [normalizedAddress]
  );
  
  // Create new merchant if not exists
  if (!merchant) {
    const result = run(
      'INSERT INTO merchants (walletAddress) VALUES (?)',
      [walletAddress]
    );
    merchant = get('SELECT * FROM merchants WHERE id = ?', [result.lastInsertRowid]);
  }
  
  return merchant;
}

// Get merchant by ID
function getMerchantById(id) {
  return get('SELECT * FROM merchants WHERE id = ?', [id]);
}

// Get auth message for frontend
function getAuthMessage() {
  return AUTH_MESSAGE;
}

module.exports = {
  verifyWalletSignature,
  generateToken,
  verifyToken,
  getOrCreateMerchant,
  getMerchantById,
  getAuthMessage
};
