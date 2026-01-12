const express = require('express');
const router = express.Router();
const { getSubscriptionsByWallet, cancelSubscription } = require('../services/subscriptionService');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/me/subscriptions - List user's subscriptions
router.get('/', (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return sendError(res, 'walletAddress query parameter is required', 'VALIDATION_ERROR', 400);
    }
    
    const subscriptions = getSubscriptionsByWallet(walletAddress);
    sendSuccess(res, subscriptions);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/me/subscriptions/:id/cancel - Cancel subscription
router.post('/:id/cancel', (req, res) => {
  try {
    const { walletAddress, txHash } = req.body;
    
    if (!walletAddress) {
      return sendError(res, 'walletAddress is required', 'VALIDATION_ERROR', 400);
    }
    
    const subscription = cancelSubscription(parseInt(req.params.id), walletAddress);
    
    if (!subscription) {
      return sendError(res, 'Subscription not found or not owned by this wallet', 'SUBSCRIPTION_NOT_FOUND', 404);
    }
    
    sendSuccess(res, subscription);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
