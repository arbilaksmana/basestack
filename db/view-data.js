/**
 * Database Viewer - View all data in SQLite database
 * Run: node db/view-data.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './db/database.sqlite';
const db = new Database(dbPath, { readonly: true });

console.log('\n' + '='.repeat(60));
console.log('📊 DATABASE VIEWER - BaseStack');
console.log('='.repeat(60));

// 1. Merchants
console.log('\n\n👤 MERCHANTS');
console.log('-'.repeat(40));
const merchants = db.prepare('SELECT * FROM merchants').all();
if (merchants.length === 0) {
    console.log('(empty)');
} else {
    console.table(merchants);
}

// 2. Plans
console.log('\n\n📋 PLANS');
console.log('-'.repeat(40));
const plans = db.prepare(`
    SELECT p.*, m.walletAddress as merchantWallet 
    FROM plans p 
    LEFT JOIN merchants m ON p.merchantId = m.id
`).all();
if (plans.length === 0) {
    console.log('(empty)');
} else {
    console.table(plans);
}

// 3. Subscribers
console.log('\n\n👥 SUBSCRIBERS');
console.log('-'.repeat(40));
const subscribers = db.prepare('SELECT * FROM subscribers').all();
if (subscribers.length === 0) {
    console.log('(empty)');
} else {
    console.table(subscribers);
}

// 4. Subscriptions
console.log('\n\n💳 SUBSCRIPTIONS');
console.log('-'.repeat(40));
const subscriptions = db.prepare(`
    SELECT s.*, sub.walletAddress as subscriberWallet, p.name as planName
    FROM subscriptions s
    LEFT JOIN subscribers sub ON s.subscriberId = sub.id
    LEFT JOIN plans p ON s.planId = p.id
`).all();
if (subscriptions.length === 0) {
    console.log('(empty)');
} else {
    console.table(subscriptions);
}

// 5. Billing Logs
console.log('\n\n📝 BILLING LOGS');
console.log('-'.repeat(40));
const billingLogs = db.prepare(`
    SELECT bl.*, s.id as subscriptionId
    FROM billingLogs bl
    LEFT JOIN subscriptions s ON bl.subscriptionId = s.id
    ORDER BY bl.createdAt DESC
    LIMIT 20
`).all();
if (billingLogs.length === 0) {
    console.log('(empty)');
} else {
    console.table(billingLogs);
}

// Summary
console.log('\n\n📈 SUMMARY');
console.log('-'.repeat(40));
console.log(`Merchants: ${merchants.length}`);
console.log(`Plans: ${plans.length}`);
console.log(`Subscribers: ${subscribers.length}`);
console.log(`Subscriptions: ${subscriptions.length}`);
console.log(`Billing Logs: ${billingLogs.length}`);

console.log('\n' + '='.repeat(60) + '\n');

db.close();
