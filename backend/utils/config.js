/**
 * Application Configuration
 * Centralized configuration management
 */

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || './reviews.db',

  // AI Agent
  aiAgentUrl: process.env.AI_AGENT_URL || 'http://localhost:8000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtExpiration: '24h',
  jwtRefreshExpiration: '7d',

  // OAuth
  oauthClientId: process.env.OAUTH_CLIENT_ID,
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET,
  oauthRedirectUri: process.env.OAUTH_REDIRECT_URI,

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    reviewLimit: 10, // 10 reviews per minute
    apiLimit: 100, // 100 requests per minute
    authLimit: 5 // 5 auth attempts per 15 minutes
  },

  // Code review limits
  maxCodeLength: 50000,
  supportedLanguages: ['javascript', 'typescript', 'python', 'go', 'java', 'cpp', 'c'],

  // Groq
  groqApiKey: process.env.GROQ_API_KEY,

  isDevelopment() {
    return this.nodeEnv === 'development';
  },

  isProduction() {
    return this.nodeEnv === 'production';
  }
};

export default config;
