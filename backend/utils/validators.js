/**
 * Validation Utilities
 * Input validation helpers
 */

import { body, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validate code review request
 */
export const validateCodeReview = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isString()
    .withMessage('Code must be a string')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Code must be between 10 and 50000 characters'),

  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isIn(['javascript', 'typescript', 'python', 'go', 'java', 'cpp', 'c'])
    .withMessage('Invalid language'),

  body('skillLevel')
    .optional()
    .trim()
    .isIn(['junior', 'mid', 'senior'])
    .withMessage('Invalid skill level'),

  body('focusAreas')
    .optional()
    .isArray()
    .withMessage('Focus areas must be an array')
    .custom((areas) => {
      const validAreas = ['bugs', 'performance', 'security', 'clean-code', 'all'];
      const invalidAreas = areas.filter(area => !validAreas.includes(area));
      if (invalidAreas.length > 0) {
        throw new Error(`Invalid focus areas: ${invalidAreas.join(', ')}`);
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validate OAuth request
 */
export const validateOAuth = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('OAuth code is required'),

  body('provider')
    .trim()
    .isIn(['google', 'github'])
    .withMessage('Invalid OAuth provider'),

  handleValidationErrors
];

/**
 * Validate ID parameter
 */
export const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || typeof id !== 'string' || id.length < 1) {
      return res.status(400).json({
        error: `Invalid ${paramName}`
      });
    }
    next();
  };
};
