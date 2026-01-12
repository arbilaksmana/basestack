const express = require('express');
const router = express.Router();
const { 
  verifyWalletSignature, 
  generateToken, 
  getOrCreateMerchant,
  getAuthMessage 
} = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/auth/message - Get message to sign
router.get('/message', (req, res) => {
  sendSuccess(res, { message: getAuthMessage() });
});

// POST /api/auth/connect-wallet - Authenticate with wallet signature
router.post('/connect-wallet', (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    // Validate input
    if (!walletAddress || !signature) {
      return sendError(res, 'walletAddress and signature are required', 'VALIDATION_ERROR', 400);
    }
    
    // Verify signature
    const isValid = verifyWalletSignature(walletAddress, signature);
    
    if (!isValid) {
      return sendError(res, 'Invalid signature', 'INVALID_SIGNATURE', 401);
    }
    
    // Get or create merchant
    const merchant = getOrCreateMerchant(walletAddress);
    
    // Generate JWT token
    const token = generateToken(merchant);
    
    sendSuccess(res, {
      token,
      merchant: {
        id: merchant.id,
        walletAddress: merchant.walletAddress,
        name: merchant.name
      }
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
