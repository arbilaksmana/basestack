const { run, get, all } = require('../utils/db');

// Get subscriptions by wallet address
function getSubscriptionsByWallet(walletAddress) {
  const normalizedAddress = walletAddress.toLowerCase();

  return all(`
    SELECT 
      s.*,
      p.name as planName,
      p.description as planDescription,
      p.billingInterval,
      sub.walletAddress as subscriberWallet
    FROM subscriptions s
    JOIN plans p ON s.planId = p.id
    JOIN subscribers sub ON s.subscriberId = sub.id
    WHERE LOWER(sub.walletAddress) = ?
    ORDER BY s.createdAt DESC
  `, [normalizedAddress]);
}

// Get subscription by ID
function getSubscriptionById(subscriptionId) {
  return get(`
    SELECT 
      s.*,
      p.name as planName,
      p.billingInterval,
      p.onchainPlanId,
      sub.walletAddress as subscriberWallet
    FROM subscriptions s
    JOIN plans p ON s.planId = p.id
    JOIN subscribers sub ON s.subscriberId = sub.id
    WHERE s.id = ?
  `, [subscriptionId]);
}

// Cancel subscription
function cancelSubscription(subscriptionId, walletAddress) {
  const normalizedAddress = walletAddress.toLowerCase();

  // Verify ownership
  const subscription = get(`
    SELECT s.* FROM subscriptions s
    JOIN subscribers sub ON s.subscriberId = sub.id
    WHERE s.id = ? AND LOWER(sub.walletAddress) = ?
  `, [subscriptionId, normalizedAddress]);

  if (!subscription) {
    return null;
  }

  // Update status
  const now = new Date().toISOString();
  run(
    'UPDATE subscriptions SET status = ?, updatedAt = ? WHERE id = ?',
    ['canceled', now, subscriptionId]
  );

  return get('SELECT * FROM subscriptions WHERE id = ?', [subscriptionId]);
}

// Update subscription status
function updateSubscriptionStatus(subscriptionId, status) {
  const now = new Date().toISOString();
  run(
    'UPDATE subscriptions SET status = ?, updatedAt = ? WHERE id = ?',
    [status, now, subscriptionId]
  );
  return get('SELECT * FROM subscriptions WHERE id = ?', [subscriptionId]);
}

// Update next payment date
function updateNextPayment(subscriptionId, nextPayment) {
  const now = new Date().toISOString();
  run(
    'UPDATE subscriptions SET nextPayment = ?, updatedAt = ? WHERE id = ?',
    [nextPayment, now, subscriptionId]
  );
  return get('SELECT * FROM subscriptions WHERE id = ?', [subscriptionId]);
}

// Create billing log
function createBillingLog(subscriptionId, txHash, status, reason = null) {
  const result = run(
    'INSERT INTO billingLogs (subscriptionId, txHash, status, reason) VALUES (?, ?, ?, ?)',
    [subscriptionId, txHash, status, reason]
  );
  return get('SELECT * FROM billingLogs WHERE id = ?', [result.lastInsertRowid]);
}

// Get subscription logs
function getSubscriptionLogs(subscriptionId) {
  return all(`
    SELECT * FROM billingLogs
    WHERE subscriptionId = ?
    ORDER BY createdAt DESC
  `, [subscriptionId]);
}

module.exports = {
  getSubscriptionsByWallet,
  getSubscriptionById,
  cancelSubscription,
  updateSubscriptionStatus,
  updateNextPayment,
  createBillingLog,
  getSubscriptionLogs
};
