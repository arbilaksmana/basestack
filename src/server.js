require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('../db/init');

// Import routes
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const dashboardRoutes = require('./routes/dashboard');
const checkoutRoutes = require('./routes/checkout');
const subscriptionRoutes = require('./routes/subscriptions');
const merchantRoutes = require('./routes/merchant');
const priceRoutes = require('./routes/prices');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/me/subscriptions', subscriptionRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/prices', priceRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Endpoint not found', code: 'NOT_FOUND' }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error', code: 'SERVER_ERROR' }
  });
});

const { runKeeper } = require('./services/keeperService');

// Internal Scheduler for Keeper
function startScheduler() {
  console.log('[Scheduler] Starting Keeper Scheduler...');

  // Run immediately on startup
  runKeeper().catch(err => console.error('[Scheduler] Initial run failed:', err.message));

  // Run every 60 seconds (Aggressive for Demo/Testing)
  // In production, change to 1 hour (60 * 60 * 1000)
  setInterval(() => {
    console.log('[Scheduler] Triggering Keeper...');
    runKeeper().catch(err => console.error('[Scheduler] Run failed:', err.message));
  }, 60 * 1000);
}

// Initialize database and start server
function start() {
  try {
    // Initialize database tables
    initDatabase();
    console.log('[Server] Database initialized');

    // Start Keeper Scheduler
    startScheduler();

    app.listen(config.port, () => {
      console.log(`[Server] Running on http://43.228.214.222:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
