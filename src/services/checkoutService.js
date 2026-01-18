const config = require('../config');
const { run, get } = require('../utils/db');
const { getPlanById, getPriceByToken } = require('./planService');
const { verifySubscriptionTx } = require('../utils/contract');

// Initialize checkout - validate and return payment info
function initCheckout(planId, walletAddress, selectedToken, country) {
  // Validate token
  if (!config.validPayTokens.includes(selectedToken)) {
    throw new Error('Invalid pay token. Must be IDRX, USDC, or USDT');
  }

  // Get plan
  const plan = getPlanById(planId);
  if (!plan || plan.status !== 'active') {
    throw new Error('Plan not found or inactive');
  }

  // Get price for selected token
  const amount = getPriceByToken(plan, selectedToken);
  if (!amount) {
    throw new Error('Price not available for selected token');
  }

  // Get token contract address
  const tokenAddress = config.tokens[selectedToken];

  return {
    planId: plan.id,
    planName: plan.name,
    amount,
    selectedToken,
    tokenAddress,
    contractAddress: config.blockchain.contractAddress,
    billingInterval: plan.billingInterval
  };
}

// Confirm checkout - verify tx and create subscription
async function confirmCheckout(planId, walletAddress, selectedToken, txHash) {
  // Validate token
  if (!config.validPayTokens.includes(selectedToken)) {
    throw new Error('Invalid pay token');
  }

  // Get plan
  const plan = getPlanById(planId);
  if (!plan || plan.status !== 'active') {
    throw new Error('Plan not found or inactive');
  }

  // Verify transaction on-chain (Always verify to prevent fraud)
  // Use onchainPlanId if available, otherwise fallback to planId (for legacy plans or testing)
  const expectedPlanId = plan.onchainPlanId || plan.id;

  const verification = await verifySubscriptionTx(txHash, walletAddress, expectedPlanId);
  if (!verification.verified) {
    throw new Error(`Transaction verification failed: ${verification.reason}`);
  }

  // Get or create subscriber
  const subscriber = getOrCreateSubscriber(walletAddress, null);

  // Get amount for selected token
  const amount = getPriceByToken(plan, selectedToken);

  // Calculate next payment (current time + billing interval)
  const nextPayment = new Date(Date.now() + plan.billingInterval * 1000).toISOString();

  // Create subscription
  const result = run(
    `INSERT INTO subscriptions (subscriberId, planId, payToken, amount, nextPayment, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [subscriber.id, planId, selectedToken, amount, nextPayment]
  );

  const subscription = get('SELECT * FROM subscriptions WHERE id = ?', [result.lastInsertRowid]);

  // Create billing log for the initial payment
  try {
    const { createBillingLog } = require('./subscriptionService');
    createBillingLog(subscription.id, txHash, 'success');
  } catch (logErr) {
    console.warn('Failed to create billing log:', logErr);
  }

  return {
    subscription,
    subscriber,
    plan: {
      id: plan.id,
      name: plan.name,
      billingInterval: plan.billingInterval
    }
  };
}

// Get or create subscriber
function getOrCreateSubscriber(walletAddress, country) {
  const normalizedAddress = walletAddress.toLowerCase();

  let subscriber = get(
    'SELECT * FROM subscribers WHERE LOWER(walletAddress) = ?',
    [normalizedAddress]
  );

  if (!subscriber) {
    const result = run(
      'INSERT INTO subscribers (walletAddress, country) VALUES (?, ?)',
      [walletAddress, country]
    );
    subscriber = get('SELECT * FROM subscribers WHERE id = ?', [result.lastInsertRowid]);
  } else if (country && !subscriber.country) {
    // Update country if not set
    run('UPDATE subscribers SET country = ? WHERE id = ?', [country, subscriber.id]);
    subscriber.country = country;
  }

  return subscriber;
}

module.exports = {
  initCheckout,
  confirmCheckout,
  getOrCreateSubscriber
};
