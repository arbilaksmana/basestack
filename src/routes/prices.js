const express = require('express');
const router = express.Router();
const { getRates, usdToIdrx } = require('../services/priceService');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/prices - Get current exchange rates
router.get('/', async (req, res) => {
  try {
    const rates = await getRates();
    sendSuccess(res, rates);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/prices/convert - Convert USD to IDRX
router.get('/convert', async (req, res) => {
  try {
    const { usd } = req.query;
    
    if (!usd || isNaN(parseFloat(usd))) {
      return sendError(res, 'usd query parameter is required', 'VALIDATION_ERROR', 400);
    }
    
    const usdAmount = parseFloat(usd);
    const idrxAmount = await usdToIdrx(usdAmount);
    const rates = await getRates();
    
    sendSuccess(res, {
      usd: usdAmount,
      idrx: idrxAmount,
      rate: rates.USD_TO_IDR,
      updatedAt: rates.updatedAt
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
