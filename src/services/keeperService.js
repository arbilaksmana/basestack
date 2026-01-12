const { all } = require('../utils/db');
const { chargeSubscription } = require('../utils/contract');
const { 
  getSubscriptionById, 
  updateSubscriptionStatus, 
  updateNextPayment, 
  createBillingLog 
} = require('./subscriptionService');

// Get all subscriptions due for billing
function getDueSubscriptions() {
  const now = new Date().toISOString();
  
  return all(`
    SELECT 
      s.*,
      p.billingInterval,
      p.onchainPlanId,
      sub.walletAddress as subscriberWallet
    FROM subscriptions s
    JOIN plans p ON s.planId = p.id
    JOIN subscribers sub ON s.subscriberId = sub.id
    WHERE s.status = 'active' AND s.nextPayment <= ?
  `, [now]);
}

// Process single subscription
async function processSubscription(subscription) {
  const { id, subscriberWallet, onchainPlanId, billingInterval } = subscription;
  
  try {
    // Call smart contract to charge subscription
    const result = await chargeSubscription(subscriberWallet, onchainPlanId || subscription.planId);
    
    if (result.success) {
      // Calculate new next payment date
      const currentNext = new Date(subscription.nextPayment);
      const newNext = new Date(currentNext.getTime() + billingInterval * 1000);
      
      // Update subscription
      updateNextPayment(id, newNext.toISOString());
      
      // Log success
      createBillingLog(id, result.txHash, 'success');
      
      return { success: true, txHash: result.txHash };
    } else {
      // Charge failed - mark as past_due
      updateSubscriptionStatus(id, 'past_due');
      createBillingLog(id, null, 'failed', result.error);
      
      return { success: false, error: result.error };
    }
  } catch (err) {
    // Unexpected error - mark as past_due
    updateSubscriptionStatus(id, 'past_due');
    createBillingLog(id, null, 'failed', err.message);
    
    return { success: false, error: err.message };
  }
}

// Run keeper - process all due subscriptions
async function runKeeper() {
  const results = {
    processed: 0,
    success: 0,
    failed: 0,
    errors: []
  };
  
  const dueSubscriptions = getDueSubscriptions();
  console.log(`[Keeper] Found ${dueSubscriptions.length} subscriptions due for billing`);
  
  for (const subscription of dueSubscriptions) {
    results.processed++;
    
    console.log(`[Keeper] Processing subscription #${subscription.id} for wallet ${subscription.subscriberWallet}`);
    
    const result = await processSubscription(subscription);
    
    if (result.success) {
      results.success++;
      console.log(`[Keeper] Success - txHash: ${result.txHash}`);
    } else {
      results.failed++;
      results.errors.push({ subscriptionId: subscription.id, error: result.error });
      console.log(`[Keeper] Failed - ${result.error}`);
    }
  }
  
  console.log(`[Keeper] Complete - Processed: ${results.processed}, Success: ${results.success}, Failed: ${results.failed}`);
  
  return results;
}

module.exports = {
  getDueSubscriptions,
  processSubscription,
  runKeeper
};
