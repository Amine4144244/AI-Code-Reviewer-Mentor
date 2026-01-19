/**
 * Review Model
 * Handles review database operations
 */

import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

class Review {
  /**
   * Find review by ID (with user verification)
   */
  static findById(id, userId) {
    const stmt = db.prepare(`
      SELECT * FROM reviews WHERE id = ? AND user_id = ?
    `);
    return stmt.get(id, userId);
  }

  /**
   * Get all reviews for a user
   */
  static findByUserId(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM reviews
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset);
  }

  /**
   * Create new review
   */
  static create({ userId, code, language, skillLevel, focusAreas, reviewResult }) {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    const focusAreasJson = JSON.stringify(focusAreas);
    const reviewResultJson = JSON.stringify(reviewResult);

    const stmt = db.prepare(`
      INSERT INTO reviews (id, user_id, code, language, skill_level, focus_areas, review_result, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, code, language, skillLevel, focusAreasJson, reviewResultJson, now);

    return this.findById(id, userId);
  }

  /**
   * Delete review
   */
  static delete(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM reviews WHERE id = ? AND user_id = ?
    `);
    return stmt.run(id, userId);
  }

  /**
   * Get review statistics for a user
   */
  static getStats(userId) {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_reviews,
        AVG(json_extract(review_result, '$.score.overall')) as avg_score,
        COUNT(DISTINCT language) as languages_used
      FROM reviews
      WHERE user_id = ?
    `);
    return stmt.get(userId);
  }

  /**
   * Get recent reviews summary
   */
  static getRecentSummary(userId, limit = 5) {
    const stmt = db.prepare(`
      SELECT
        id,
        language,
        skill_level,
        json_extract(review_result, '$.score.overall') as score,
        created_at,
        substr(code, 1, 100) as code_preview
      FROM reviews
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }
}

export default Review;
