const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS users (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'username TEXT UNIQUE NOT NULL,\n' +
      'password_hash TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
      ')'
  );
});

module.exports = db;
