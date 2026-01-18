const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createPlan, getPlansByMerchant, updatePlan } = require('../services/planService');
const { sendSuccess, sendError } = require('../utils/response');

// All routes require authentication
router.use(authMiddleware);

// POST /api/plans - Create new plan
router.post('/', (req, res) => {
  try {
    const { name, description, billingInterval, priceIdrx, priceUsdc, priceUsdt, onchainPlanId } = req.body;

    // Validate required fields
    if (!name || !billingInterval || priceIdrx === undefined || priceUsdc === undefined || priceUsdt === undefined) {
      return sendError(res, 'name, billingInterval, priceIdrx, priceUsdc, priceUsdt are required', 'VALIDATION_ERROR', 400);
    }

    // Validate billing interval (minimum 1 day = 86400 seconds)
    if (billingInterval < 86400) {
      return sendError(res, 'billingInterval must be at least 86400 seconds (1 day)', 'VALIDATION_ERROR', 400);
    }

    const plan = createPlan(req.merchant.id, {
      name,
      description,
      billingInterval,
      priceIdrx,
      priceUsdc,
      priceUsdt,
      onchainPlanId
    });

    sendSuccess(res, plan, 201);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/plans - List merchant's plans
router.get('/', (req, res) => {
  try {
    const plans = getPlansByMerchant(req.merchant.id);
    sendSuccess(res, plans);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PATCH /api/plans/:id - Update plan
router.patch('/:id', (req, res) => {
  try {
    const plan = updatePlan(req.params.id, req.merchant.id, req.body);

    if (!plan) {
      return sendError(res, 'Plan not found', 'PLAN_NOT_FOUND', 404);
    }

    sendSuccess(res, plan);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
