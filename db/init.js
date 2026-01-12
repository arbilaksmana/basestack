const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './db/database.sqlite';

function initDatabase() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create merchants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      walletAddress TEXT UNIQUE NOT NULL,
      name TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchantId INTEGER NOT NULL,
      onchainPlanId INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      billingInterval INTEGER NOT NULL,
      priceIdrx INTEGER NOT NULL,
      priceUsdc INTEGER NOT NULL,
      priceUsdt INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchantId) REFERENCES merchants(id)
    )
  `);

  // Create subscribers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      walletAddress TEXT UNIQUE NOT NULL,
      country TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create subscriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriberId INTEGER NOT NULL,
      planId INTEGER NOT NULL,
      payToken TEXT NOT NULL,
      amount INTEGER NOT NULL,
      nextPayment TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscriberId) REFERENCES subscribers(id),
      FOREIGN KEY (planId) REFERENCES plans(id)
    )
  `);

  // Create billingLogs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS billingLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriptionId INTEGER NOT NULL,
      txHash TEXT,
      status TEXT NOT NULL,
      reason TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_plans_merchantId ON plans(merchantId);
    CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriberId ON subscriptions(subscriberId);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_planId ON subscriptions(planId);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_nextPayment ON subscriptions(nextPayment);
    CREATE INDEX IF NOT EXISTS idx_billingLogs_subscriptionId ON billingLogs(subscriptionId);
  `);

  console.log('Database initialized successfully');
  db.close();
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
