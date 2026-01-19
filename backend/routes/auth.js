/**
 * Authentication Routes
 * Handles OAuth login and token management
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { validateOAuth } from '../utils/validators.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { exchangeOAuthCode, generateTokens } from '../services/authService.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Initiate OAuth login with code
 */
router.post(
  '/login',
  authRateLimiter,
  validateOAuth,
  asyncHandler(async (req, res) => {
    const { code, provider } = req.body;

    // Exchange OAuth code for user info
    const oauthUserInfo = await exchangeOAuthCode(code, provider);

    // Find or create user
    let user = User.findByOAuthId(oauthUserInfo.oauthId);

    if (!user) {
      // Check if user exists with same email
      const existingUser = User.findByEmail(oauthUserInfo.email);

      if (existingUser) {
        // Update existing user with new OAuth ID
        user = User.update(existingUser.id, {
          oauthId: oauthUserInfo.oauthId
        });
      } else {
        // Create new user
        user = User.create(oauthUserInfo);
      }
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Return user info and tokens
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url
      },
      ...tokens
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user exists
    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json(tokens);
  })
);

/**
 * POST /api/auth/logout
 * Logout (invalidate token - client-side token removal)
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    // In a more secure implementation, we would:
    // 1. Add token to blacklist
    // 2. Store blacklisted tokens in Redis
    // For now, we just confirm logout

    res.json({ message: 'Logged out successfully' });
  })
);

/**
 * GET /api/auth/user
 * Get current user info (protected)
 */
router.get(
  '/user',
  asyncHandler(async (req, res) => {
    // User is attached by auth middleware
    const user = User.getWithReviewCount(req.user.id);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      reviewCount: user.review_count,
      createdAt: user.created_at
    });
  })
);

export default router;
