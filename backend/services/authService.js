/**
 * Authentication Service
 * Handles JWT token generation and OAuth integration
 */

import jwt from 'jsonwebtoken';
import config from '../utils/config.js';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiration }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

/**
 * Exchange OAuth code for user info (mock implementation)
 * In production, this would call the actual OAuth providers
 */
export const exchangeOAuthCode = async (code, provider) => {
  // Mock implementation - in production, this would:
  // 1. Exchange code for access token with provider
  // 2. Use access token to get user profile
  // 3. Return standardized user info

  // For now, return mock user data
  const mockUsers = {
    google: {
      oauthId: 'google_123456',
      email: 'user@gmail.com',
      name: 'Google User',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default'
    },
    github: {
      oauthId: 'github_123456',
      email: 'user@github.com',
      name: 'GitHub User',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1'
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return mockUsers[provider] || mockUsers.google;
};

/**
 * Generate tokens for user
 */
export const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwtExpiration
  };
};
