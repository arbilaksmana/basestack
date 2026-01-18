const { run, get, all } = require('../utils/db');

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

// Create new plan
function createPlan(merchantId, planData) {
  const { name, description, billingInterval, priceIdrx, priceUsdc, priceUsdt, onchainPlanId } = planData;
  const slug = generateSlug(name);

  const result = run(
    `INSERT INTO plans (merchantId, name, slug, description, billingInterval, priceIdrx, priceUsdc, priceUsdt, onchainPlanId, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [merchantId, name, slug, description || '', billingInterval, priceIdrx, priceUsdc, priceUsdt, onchainPlanId || null]
  );

  return get('SELECT * FROM plans WHERE id = ?', [result.lastInsertRowid]);
}

// Get all plans by merchant
function getPlansByMerchant(merchantId) {
  return all('SELECT * FROM plans WHERE merchantId = ? ORDER BY createdAt DESC', [merchantId]);
}

// Get plan by slug (for checkout)
function getPlanBySlug(slug) {
  return get('SELECT * FROM plans WHERE slug = ? AND status = ?', [slug, 'active']);
}

// Get plan by ID
function getPlanById(planId) {
  return get('SELECT * FROM plans WHERE id = ?', [planId]);
}

// Update plan
function updatePlan(planId, merchantId, updates) {
  const plan = get('SELECT * FROM plans WHERE id = ? AND merchantId = ?', [planId, merchantId]);
  if (!plan) return null;

  const fields = [];
  const values = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.onchainPlanId !== undefined) { fields.push('onchainPlanId = ?'); values.push(updates.onchainPlanId); }

  if (fields.length === 0) return plan;

  values.push(planId);
  run(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`, values);

  return get('SELECT * FROM plans WHERE id = ?', [planId]);
}

// Get price by token
function getPriceByToken(plan, token) {
  const tokenMap = {
    'IDRX': plan.priceIdrx,
    'USDC': plan.priceUsdc,
    'USDT': plan.priceUsdt
  };
  return tokenMap[token] || null;
}

module.exports = {
  createPlan,
  getPlansByMerchant,
  getPlanBySlug,
  getPlanById,
  updatePlan,
  getPriceByToken
};
