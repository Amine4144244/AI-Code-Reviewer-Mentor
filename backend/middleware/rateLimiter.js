/**
 * Rate Limiting Middleware
 * Implements rate limiting for API endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for code review submissions
 * Limits authenticated users to 10 requests per minute
 */
export const reviewRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many code review requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});

/**
 * Rate limiter for general API requests
 * Limits all requests to 100 per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for authentication endpoints
 * Stricter limit to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});
