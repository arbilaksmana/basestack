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

    // Revenue Split (by Volume in USD)
    const splitRows = all(`
      SELECT 
        s.payToken,
        SUM(CAST(s.amount AS REAL) * (2592000.0 / p.billingInterval)) as monthlyRevenue
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      WHERE p.merchantId = ? AND s.status = 'active'
      GROUP BY s.payToken
    `, [merchantId]);

    // Calculate USD totals
    let totalUsdVolume = 0;
    const splits = splitRows.map(row => {
      let usdValue = 0;
      // Simple conversion: IDRX / 16000, others 1:1
      if (row.payToken === 'IDRX') {
        usdValue = row.monthlyRevenue / 16000;
      } else {
        usdValue = row.monthlyRevenue;
      }
      totalUsdVolume += usdValue;
      return { token: row.payToken, usdValue };
    });

    // Calculate percentages
    const revenueSplit = splits.map(s => ({
      token: s.token,
      percentage: totalUsdVolume > 0 ? Math.round((s.usdValue / totalUsdVolume) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    sendSuccess(res, {
      activeCount,
      pastDueCount,
      mrr,
      totalSubscribers,
      revenueSplit
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
      SELECT 
        s.*,
        sub.walletAddress,
        sub.country,
        p.name as planName
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      JOIN subscribers sub ON s.subscriberId = sub.id
      WHERE p.merchantId = ?
      ORDER BY s.createdAt DESC
    `, [merchantId]);

    sendSuccess(res, subscribers);
  } catch (err) {
    sendError(res, err.message, 'SERVER_ERROR', 500);
  }
});
