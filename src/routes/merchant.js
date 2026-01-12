const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { run, get } = require('../utils/db');
const { sendSuccess, sendError } = require('../utils/response');

// All routes require authentication
router.use(authMiddleware);

// GET /api/merchant/profile - Get merchant profile
router.get('/profile', (req, res) => {
  try {
    sendSuccess(res, {
      id: req.merchant.id,
      walletAddress: req.merchant.walletAddress,
      name: req.merchant.name,
      createdAt: req.merchant.createdAt
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// PATCH /api/merchant/profile - Update merchant profile
router.patch('/profile', (req, res) => {
  try {
    const { name } = req.body;
    
    if (name !== undefined) {
      run('UPDATE merchants SET name = ? WHERE id = ?', [name, req.merchant.id]);
    }
    
    const merchant = get('SELECT * FROM merchants WHERE id = ?', [req.merchant.id]);
    
    sendSuccess(res, {
      id: merchant.id,
      walletAddress: merchant.walletAddress,
      name: merchant.name,
      createdAt: merchant.createdAt
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;
