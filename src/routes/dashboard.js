const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { get, all, run } = require('../utils/db');
const { sendSuccess, sendError } = require('../utils/response');

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/metrics - Get merchant dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    // Count active subscriptions for merchant's plans
    const activeCount = get(`
      SELECT COUNT(*) as count 
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ? AND s.status = 'active'
    `, [merchantId])?.count || 0;
    
    // Count past_due subscriptions
    const pastDueCount = get(`
      SELECT COUNT(*) as count 
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ? AND s.status = 'past_due'
    `, [merchantId])?.count || 0;
    
    // Calculate MRR (Monthly Recurring Revenue) - sum of active subscription amounts
    // Normalized to monthly (assuming billingInterval is in seconds)
    const mrrResult = get(`
      SELECT 
        SUM(CAST(s.amount AS REAL) * (2592000.0 / p.billingInterval)) as mrr
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ? AND s.status = 'active'
    `, [merchantId]);
    
    const mrr = Math.round(mrrResult?.mrr || 0);
    
    // Total subscribers (unique)
    const totalSubscribers = get(`
      SELECT COUNT(DISTINCT s.subscriberId) as count
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ?
    `, [merchantId])?.count || 0;
    
    sendSuccess(res, {
      activeCount,
      pastDueCount,
      mrr,
      totalSubscribers
    });
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

module.exports = router;


// GET /api/dashboard/billing-logs - Get billing logs for merchant
router.get('/billing-logs', (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    const logs = all(`
      SELECT 
        bl.*,
        s.payToken,
        s.amount,
        p.name as planName,
        sub.walletAddress as subscriberWallet
      FROM billingLogs bl
      JOIN subscriptions s ON bl.subscriptionId = s.id
      JOIN plans p ON s.planId = p.id
      JOIN subscribers sub ON s.subscriberId = sub.id
      WHERE p.merchantId = ?
      ORDER BY bl.createdAt DESC
      LIMIT 100
    `, [merchantId]);
    
    sendSuccess(res, logs);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});

// GET /api/dashboard/subscribers - Get all subscribers for merchant
router.get('/subscribers', (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    const subscribers = all(`
      SELECT DISTINCT
        sub.*,
        COUNT(s.id) as subscriptionCount,
        SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as activeCount
      FROM subscribers sub
      JOIN subscriptions s ON sub.id = s.subscriberId
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ?
      GROUP BY sub.id
      ORDER BY sub.createdAt DESC
    `, [merchantId]);
    
    sendSuccess(res, subscribers);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});
