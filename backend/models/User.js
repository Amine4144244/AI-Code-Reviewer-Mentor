/**
 * User Model
 * Handles user database operations
 */

import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

class User {
  /**
   * Find user by ID
   */
  static findById(id) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Find user by OAuth ID
   */
  static findByOAuthId(oauthId) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE oauth_id = ?
    `);
    return stmt.get(oauthId);
  }

  /**
   * Find user by email
   */
  static findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
    return stmt.get(email);
  }

  /**
   * Create new user
   */
  static create({ oauthId, email, name, avatarUrl }) {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO users (id, oauth_id, email, name, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, oauthId, email, name, avatarUrl, now, now);

    return this.findById(id);
  }

  /**
   * Update user
   */
  static update(id, updates) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Delete user
   */
  static delete(id) {
    const stmt = db.prepare(`
      DELETE FROM users WHERE id = ?
    `);
    return stmt.run(id);
  }

  /**
   * Get user with review count
   */
  static getWithReviewCount(userId) {
    const stmt = db.prepare(`
      SELECT u.*, COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `);
    return stmt.get(userId);
  }
}

export default User;
