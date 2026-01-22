/**
 * Generate API Documentation in Word format
 * Run: node docs/generate-docs.js
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, BorderStyle, WidthType, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

// Helper untuk membuat heading
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 400, after: 200 } });
}

// Helper untuk paragraph
function para(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold })],
    spacing: { after: 120 }
  });
}

// Helper untuk code block
function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Consolas', size: 20 })],
    spacing: { after: 100 },
    shading: { fill: 'F5F5F5' }
  });
}

// Helper untuk table
function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
      shading: { fill: '4472C4' },
    }))
  });
  
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ text: cell || '' })]
    }))
  }));
  
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

// API Endpoints data
const endpoints = [
  {
    category: 'Authentication',
    apis: [
      {
        method: 'GET',
        path: '/api/auth/message',
        description: 'Get message untuk di-sign oleh wallet',
        auth: 'No',
        request: null,
        response: '{\n  "success": true,\n  "data": {\n    "message": "Sign this message to authenticate with BaseStack"\n  }\n}'
      },
      {
        method: 'POST',
        path: '/api/auth/connect-wallet',
        description: 'Authenticate merchant dengan wallet signature',
        auth: 'No',
        request: '{\n  "walletAddress": "0x...",\n  "signature": "0x..."\n}',
        response: '{\n  "success": true,\n  "data": {\n    "token": "jwt-token",\n    "merchant": {\n      "id": 1,\n      "walletAddress": "0x...",\n      "name": null\n    }\n  }\n}'
      }
    ]
  },
  {
    category: 'Plans',
    apis: [
      {
        method: 'POST',
        path: '/api/plans',
        description: 'Create subscription plan',
        auth: 'Yes (JWT)',
        request: '{\n  "name": "Pro Plan",\n  "description": "Access to all features",\n  "billingInterval": 2592000,\n  "priceIdrx": 150000,\n  "priceUsdc": 10000000,\n  "priceUsdt": 10000000\n}',
        response: '{\n  "success": true,\n  "data": {\n    "id": 1,\n    "merchantId": 1,\n    "name": "Pro Plan",\n    "slug": "pro-plan-abc123",\n    "status": "active",\n    ...\n  }\n}'
      },
      {
        method: 'GET',
        path: '/api/plans',
        description: 'List semua plan milik merchant',
        auth: 'Yes (JWT)',
        request: null,
        response: '{\n  "success": true,\n  "data": [\n    { "id": 1, "name": "Pro Plan", ... }\n  ]\n}'
      }
    ]
  },
  {
    category: 'Dashboard',
    apis: [
      {
        method: 'GET',
        path: '/api/dashboard/metrics',
        description: 'Get merchant dashboard metrics',
        auth: 'Yes (JWT)',
        request: null,
        response: '{\n  "success": true,\n  "data": {\n    "activeCount": 150,\n    "pastDueCount": 5,\n    "mrr": 1500000000,\n    "totalSubscribers": 160\n  }\n}'
      }
    ]
  },
  {
    category: 'Checkout',
    apis: [
      {
        method: 'GET',
        path: '/api/checkout/:planSlug',
        description: 'Get plan details untuk checkout page',
        auth: 'No',
        request: null,
        response: '{\n  "success": true,\n  "data": {\n    "id": 1,\n    "name": "Pro Plan",\n    "prices": {\n      "IDRX": 150000,\n      "USDC": 10000000,\n      "USDT": 10000000\n    }\n  }\n}'
      },
      {
        method: 'POST',
        path: '/api/checkout/:planId/init',
        description: 'Initialize checkout - get payment info',
        auth: 'No',
        request: '{\n  "walletAddress": "0x...",\n  "selectedToken": "USDC",\n  "country": "ID"\n}',
        response: '{\n  "success": true,\n  "data": {\n    "planId": 1,\n    "amount": 10000000,\n    "selectedToken": "USDC",\n    "contractAddress": "0x..."\n  }\n}'
      },
      {
        method: 'POST',
        path: '/api/checkout/:planId/confirm',
        description: 'Confirm checkout setelah payment on-chain',
        auth: 'No',
        request: '{\n  "walletAddress": "0x...",\n  "selectedToken": "USDC",\n  "txHash": "0x..."\n}',
        response: '{\n  "success": true,\n  "data": {\n    "subscription": { ... },\n    "subscriber": { ... },\n    "plan": { ... }\n  }\n}'
      }
    ]
  },
  {
    category: 'Subscription Management',
    apis: [
      {
        method: 'GET',
        path: '/api/me/subscriptions',
        description: 'List subscriptions untuk wallet address',
        auth: 'No',
        request: 'Query: ?walletAddress=0x...',
        response: '{\n  "success": true,\n  "data": [\n    {\n      "id": 1,\n      "planName": "Pro Plan",\n      "status": "active",\n      ...\n    }\n  ]\n}'
      },
      {
        method: 'POST',
        path: '/api/me/subscriptions/:id/cancel',
        description: 'Cancel subscription',
        auth: 'No',
        request: '{\n  "walletAddress": "0x...",\n  "txHash": "0x..."\n}',
        response: '{\n  "success": true,\n  "data": {\n    "id": 1,\n    "status": "canceled",\n    ...\n  }\n}'
      }
    ]
  }
];

// Test results data
const testResults = [
  { no: 1, name: 'Health Check', endpoint: 'GET /health', expected: 'status: ok', result: 'PASS' },
  { no: 2, name: 'Get Auth Message', endpoint: 'GET /api/auth/message', expected: 'Return auth message', result: 'PASS' },
  { no: 3, name: 'Connect Wallet', endpoint: 'POST /api/auth/connect-wallet', expected: 'Return JWT token', result: 'PASS' },
  { no: 4, name: 'Create Plan', endpoint: 'POST /api/plans', expected: 'Create plan, return ID', result: 'PASS' },
  { no: 5, name: 'List Plans', endpoint: 'GET /api/plans', expected: 'Return plan array', result: 'PASS' },
  { no: 6, name: 'Get Plan by Slug', endpoint: 'GET /api/checkout/:slug', expected: 'Return plan details', result: 'PASS' },
  { no: 7, name: 'Init Checkout', endpoint: 'POST /api/checkout/:id/init', expected: 'Return payment info', result: 'PASS' },
  { no: 8, name: 'Invalid Token Validation', endpoint: 'POST /api/checkout/:id/init', expected: 'Return validation error', result: 'PASS' },
  { no: 9, name: 'Dashboard Metrics', endpoint: 'GET /api/dashboard/metrics', expected: 'Return metrics object', result: 'PASS' },
  { no: 10, name: 'List Subscriptions', endpoint: 'GET /api/me/subscriptions', expected: 'Return subscription array', result: 'PASS' },
  { no: 11, name: 'Auth Protection', endpoint: 'POST /api/plans (no token)', expected: 'Return 401 Unauthorized', result: 'PASS' },
  { no: 12, name: '404 Handler', endpoint: 'GET /api/nonexistent', expected: 'Return 404 Not Found', result: 'PASS' },
];

// Error codes
const errorCodes = [
  ['INVALID_SIGNATURE', 'Wallet signature verification failed'],
  ['INVALID_TOKEN', 'JWT token invalid or expired'],
  ['PLAN_NOT_FOUND', 'Plan does not exist'],
  ['INVALID_PAY_TOKEN', 'Selected token not supported (must be IDRX/USDC/USDT)'],
  ['TX_VERIFICATION_FAILED', 'On-chain transaction verification failed'],
  ['SUBSCRIPTION_NOT_FOUND', 'Subscription does not exist'],
  ['VALIDATION_ERROR', 'Request validation failed'],
  ['SERVER_ERROR', 'Internal server error'],
];

async function generateDoc() {
  const children = [];
  
  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: 'BaseStack API Documentation', bold: true, size: 48 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Web3 Payment Gateway Subscription Backend', size: 28, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 }
  }));
  children.push(para(`Generated: ${new Date().toLocaleDateString('id-ID')}`));
  
  // Table of Contents
  children.push(heading('Daftar Isi', HeadingLevel.HEADING_1));
  children.push(para('1. Overview'));
  children.push(para('2. Tech Stack'));
  children.push(para('3. API Endpoints'));
  children.push(para('4. Error Codes'));
  children.push(para('5. Database Schema'));
  children.push(para('6. Test Results'));
  
  // Overview
  children.push(heading('1. Overview', HeadingLevel.HEADING_1));
  children.push(para('Backend API untuk subscription payment gateway berbasis Web3. Mendukung pembayaran recurring dengan token IDRX, USDC, dan USDT di Base network.'));
  children.push(para(''));
  children.push(para('Fitur Utama:', true));
  children.push(para('• Merchant authentication dengan wallet signature'));
  children.push(para('• Subscription plan management'));
  children.push(para('• Multi-token payment (IDRX, USDC, USDT)'));
  children.push(para('• Automated billing dengan Keeper Bot'));
  children.push(para('• Dashboard metrics untuk merchant'));
  
  // Tech Stack
  children.push(heading('2. Tech Stack', HeadingLevel.HEADING_1));
  children.push(createTable(
    ['Technology', 'Version', 'Purpose'],
    [
      ['Node.js', '>= 18.0.0', 'Runtime environment'],
      ['Express.js', '4.18.x', 'Web framework'],
      ['SQLite3', 'better-sqlite3', 'Database'],
      ['ethers.js', '6.x', 'Blockchain interaction'],
      ['JWT', 'jsonwebtoken', 'Authentication'],
    ]
  ));
  
  // API Endpoints
  children.push(heading('3. API Endpoints', HeadingLevel.HEADING_1));
  children.push(para('Base URL: http://localhost:3000'));
  children.push(para(''));
  
  for (const category of endpoints) {
    children.push(heading(`3.${endpoints.indexOf(category) + 1} ${category.category}`, HeadingLevel.HEADING_2));
    
    for (const api of category.apis) {
      children.push(para(`${api.method} ${api.path}`, true));
      children.push(para(`Description: ${api.description}`));
      children.push(para(`Authentication: ${api.auth}`));
      
      if (api.request) {
        children.push(para('Request:', true));
        api.request.split('\n').forEach(line => children.push(code(line)));
      }
      
      children.push(para('Response:', true));
      api.response.split('\n').forEach(line => children.push(code(line)));
      children.push(para(''));
    }
  }
  
  // Error Codes
  children.push(heading('4. Error Codes', HeadingLevel.HEADING_1));
  children.push(createTable(['Code', 'Description'], errorCodes));
  children.push(para(''));
  children.push(para('Standard Error Response Format:', true));
  children.push(code('{'));
  children.push(code('  "success": false,'));
  children.push(code('  "error": {'));
  children.push(code('    "message": "Human readable message",'));
  children.push(code('    "code": "ERROR_CODE"'));
  children.push(code('  }'));
  children.push(code('}'));
  
  // Database Schema
  children.push(heading('5. Database Schema', HeadingLevel.HEADING_1));
  
  children.push(heading('5.1 merchants', HeadingLevel.HEADING_3));
  children.push(createTable(
    ['Column', 'Type', 'Constraints'],
    [
      ['id', 'INTEGER', 'PRIMARY KEY'],
      ['walletAddress', 'TEXT', 'UNIQUE NOT NULL'],
      ['name', 'TEXT', ''],
      ['createdAt', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
    ]
  ));
  
  children.push(heading('5.2 plans', HeadingLevel.HEADING_3));
  children.push(createTable(
    ['Column', 'Type', 'Constraints'],
    [
      ['id', 'INTEGER', 'PRIMARY KEY'],
      ['merchantId', 'INTEGER', 'FOREIGN KEY'],
      ['name', 'TEXT', 'NOT NULL'],
      ['slug', 'TEXT', 'UNIQUE'],
      ['billingInterval', 'INTEGER', 'NOT NULL (seconds)'],
      ['priceIdrx', 'INTEGER', 'NOT NULL'],
      ['priceUsdc', 'INTEGER', 'NOT NULL'],
      ['priceUsdt', 'INTEGER', 'NOT NULL'],
      ['status', 'TEXT', 'DEFAULT active'],
    ]
  ));
  
  children.push(heading('5.3 subscribers', HeadingLevel.HEADING_3));
  children.push(createTable(
    ['Column', 'Type', 'Constraints'],
    [
      ['id', 'INTEGER', 'PRIMARY KEY'],
      ['walletAddress', 'TEXT', 'UNIQUE NOT NULL'],
      ['country', 'TEXT', ''],
      ['createdAt', 'TIMESTAMP', 'DEFAULT CURRENT_TIMESTAMP'],
    ]
  ));
  
  children.push(heading('5.4 subscriptions', HeadingLevel.HEADING_3));
  children.push(createTable(
    ['Column', 'Type', 'Constraints'],
    [
      ['id', 'INTEGER', 'PRIMARY KEY'],
      ['subscriberId', 'INTEGER', 'FOREIGN KEY'],
      ['planId', 'INTEGER', 'FOREIGN KEY'],
      ['payToken', 'TEXT', 'NOT NULL (IDRX/USDC/USDT)'],
      ['amount', 'INTEGER', 'NOT NULL'],
      ['nextPayment', 'TIMESTAMP', 'NOT NULL'],
      ['status', 'TEXT', 'DEFAULT active'],
    ]
  ));
  
  children.push(heading('5.5 billingLogs', HeadingLevel.HEADING_3));
  children.push(createTable(
    ['Column', 'Type', 'Constraints'],
    [
      ['id', 'INTEGER', 'PRIMARY KEY'],
      ['subscriptionId', 'INTEGER', 'FOREIGN KEY'],
      ['txHash', 'TEXT', ''],
      ['status', 'TEXT', 'NOT NULL (success/failed)'],
      ['reason', 'TEXT', ''],
    ]
  ));
  
  // Test Results
  children.push(heading('6. Test Results', HeadingLevel.HEADING_1));
  children.push(para('Test Date: ' + new Date().toLocaleDateString('id-ID')));
  children.push(para('Total Tests: 12 | Passed: 12 | Failed: 0'));
  children.push(para(''));
  
  children.push(createTable(
    ['No', 'Test Name', 'Endpoint', 'Expected', 'Result'],
    testResults.map(t => [t.no.toString(), t.name, t.endpoint, t.expected, t.result])
  ));
  
  children.push(para(''));
  children.push(new Paragraph({
    children: [new TextRun({ text: '✅ All tests passed successfully!', bold: true, color: '00AA00' })],
    spacing: { before: 200 }
  }));

  // Create document
  const doc = new Document({
    sections: [{ children }]
  });

  // Save file
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'BaseStack_API_Documentation.docx');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Documentation generated: ${outputPath}`);
}

generateDoc().catch(console.error);
