const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.resolve(__dirname, '../../scripts/database/Ibimina_database.db')

// Connect to SQLite
const db = new Database(dbPath)

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

console.log('Connected to SQLite database successfully!');

module.exports = db;