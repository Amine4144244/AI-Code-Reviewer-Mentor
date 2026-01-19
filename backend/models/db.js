/**
 * SQLite Database Configuration
 * Initializes database connection and creates tables
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../reviews.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Create all tables
 */
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      oauth_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      skill_level TEXT NOT NULL,
      focus_areas TEXT NOT NULL,
      review_result TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_users_oauth_id ON users(oauth_id);
  `);

  console.log('Database initialized successfully');
}

// Initialize database on load
initializeDatabase();

export default db;
