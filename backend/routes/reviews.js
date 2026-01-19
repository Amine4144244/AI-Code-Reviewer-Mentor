/**
 * Code Review Routes
 * Handles code review submissions and history
 */

import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { reviewRateLimiter } from '../middleware/rateLimiter.js';
import { validateCodeReview, validateId } from '../utils/validators.js';
import { analyzeCode } from '../services/aiService.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/reviews/analyze
 * Submit code for review (protected)
 */
router.post(
  '/analyze',
  authenticate,
  reviewRateLimiter,
  validateCodeReview,
  asyncHandler(async (req, res) => {
    const { code, language, skillLevel = 'mid', focusAreas = ['bugs', 'performance', 'security', 'clean-code'] } = req.body;

    logger.info('Code review requested', {
      userId: req.user.id,
      language,
      skillLevel,
      codeLength: code.length
    });

    // Call AI agent to analyze code
    const reviewResult = await analyzeCode(code, language, skillLevel, focusAreas);

    // Save review to database
    const review = Review.create({
      userId: req.user.id,
      code,
      language,
      skillLevel,
      focusAreas,
      reviewResult
    });

    // Return review result
    res.json({
      id: review.id,
      ...reviewResult,
      createdAt: review.created_at
    });
  })
);

/**
 * GET /api/reviews/history
 * Get user's review history (protected)
 */
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validate limit and offset
    if (limit > 100) {
      return res.status(400).json({ error: 'Limit cannot exceed 100' });
    }

    if (limit < 1 || offset < 0) {
      return res.status(400).json({ error: 'Invalid limit or offset' });
    }

    const reviews = Review.findByUserId(req.user.id, limit, offset);
    const stats = Review.getStats(req.user.id);

    res.json({
      reviews,
      stats: {
        totalReviews: stats.total_reviews,
        averageScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        languagesUsed: stats.languages_used
      }
    });
  })
);

/**
 * GET /api/reviews/:id
 * Get specific review (protected)
 */
router.get(
  '/:id',
  authenticate,
  validateId('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = Review.findById(id, req.user.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Parse JSON fields
    const reviewData = {
      id: review.id,
      code: review.code,
      language: review.language,
      skillLevel: review.skill_level,
      focusAreas: JSON.parse(review.focus_areas),
      reviewResult: JSON.parse(review.review_result),
      createdAt: review.created_at
    };

    res.json(reviewData);
  })
);

/**
 * DELETE /api/reviews/:id
 * Delete review (protected)
 */
router.delete(
  '/:id',
  authenticate,
  validateId('id'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = Review.delete(id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  })
);

/**
 * GET /api/reviews/stats
 * Get user's review statistics (protected)
 */
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req, res) => {
    const stats = Review.getStats(req.user.id);
    const recentReviews = Review.getRecentSummary(req.user.id, 5);

    res.json({
      totalReviews: stats.total_reviews,
      averageScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
      languagesUsed: stats.languages_used,
      recentReviews
    });
  })
);

export default router;
