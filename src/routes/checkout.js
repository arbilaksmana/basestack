const express = require('express');
const router = express.Router();
const { getPlanBySlug, getPlanById } = require('../services/planService');
const { initCheckout, confirmCheckout } = require('../services/checkoutService');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/checkout/:planSlug - Get plan details for checkout
router.get('/:planSlug', (req, res) => {
  try {
    const plan = getPlanBySlug(req.params.planSlug);
    
    if (!plan) {
      return sendError(res, 'Plan not found', 'PLAN_NOT_FOUND', 404);
    }
    
    sendSuccess(res, {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      billingInterval: plan.billingInterval,
      prices: {
        IDRX: plan.priceIdrx,
        USDC: plan.priceUsdc,
        USDT: plan.priceUsdt
      }
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/checkout/:planId/init - Initialize checkout
router.post('/:planId/init', (req, res) => {
  try {
    const { walletAddress, selectedToken, country } = req.body;
    
    if (!walletAddress || !selectedToken) {
      return sendError(res, 'walletAddress and selectedToken are required', 'VALIDATION_ERROR', 400);
    }
    
    const checkoutInfo = initCheckout(
      parseInt(req.params.planId),
      walletAddress,
      selectedToken,
      country
    );
    
    sendSuccess(res, checkoutInfo);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('Invalid')) {
      return sendError(res, err.message, 'VALIDATION_ERROR', 400);
    }
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// POST /api/checkout/:planId/confirm - Confirm checkout after payment
router.post('/:planId/confirm', async (req, res) => {
  try {
    const { walletAddress, selectedToken, txHash } = req.body;
    
    if (!walletAddress || !selectedToken || !txHash) {
      return sendError(res, 'walletAddress, selectedToken, and txHash are required', 'VALIDATION_ERROR', 400);
    }
    
    const result = await confirmCheckout(
      parseInt(req.params.planId),
      walletAddress,
      selectedToken,
      txHash
    );
    
    sendSuccess(res, result, 201);
  } catch (err) {
    if (err.message.includes('verification failed')) {
      return sendError(res, err.message, 'TX_VERIFICATION_FAILED', 400);
    }
    if (err.message.includes('not found') || err.message.includes('Invalid')) {
      return sendError(res, err.message, 'VALIDATION_ERROR', 400);
    }
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
