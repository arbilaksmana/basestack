const Database = require('better-sqlite3');
const config = require('../config');

let db = null;

// Get database instance (singleton)
function getDb() {
  if (!db) {
    db = new Database(config.database.path);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// Run INSERT/UPDATE/DELETE - returns { changes, lastInsertRowid }
function run(sql, params = []) {
  const stmt = getDb().prepare(sql);
  return stmt.run(...params);
}

// Get single row
function get(sql, params = []) {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params);
}

// Get all rows
function all(sql, params = []) {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params);
}

// Close database connection
function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, run, get, all, close };
