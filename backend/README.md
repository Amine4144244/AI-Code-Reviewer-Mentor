# AI Code Reviewer & Mentor - Backend

Express.js backend API for the AI Code Reviewer & Mentor application. Handles authentication, code review orchestration, and data persistence.

## Architecture

```
backend/
├── server.js              # Express server entry point
├── models/                # Database models
│   ├── db.js             # SQLite configuration
│   ├── User.js           # User model
│   └── Review.js         # Review model
├── routes/                # API route handlers
│   ├── auth.js           # Authentication endpoints
│   └── reviews.js        # Code review endpoints
├── middleware/            # Express middleware
│   ├── rateLimiter.js    # Rate limiting
│   ├── authMiddleware.js # JWT authentication
│   └── errorHandler.js   # Error handling
├── services/              # Business logic
│   ├── authService.js    # OAuth & JWT tokens
│   └── aiService.js      # AI agent communication
├── utils/                 # Utilities
│   ├── config.js         # Configuration
│   ├── logger.js         # Logging
│   └── validators.js     # Input validation
└── package.json          # Dependencies
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  oauth_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  focus_areas TEXT NOT NULL,  -- JSON array
  review_result TEXT NOT NULL, -- JSON object
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Initiate OAuth login.

**Request:**
```json
{
  "code": "oauth_code_from_provider",
  "provider": "google|github"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://..."
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": "24h"
}
```

#### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### POST /api/auth/logout
Logout (client-side token removal).

#### GET /api/auth/user
Get current user info (protected).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "reviewCount": 42,
  "createdAt": 1234567890
}
```

### Code Reviews

#### POST /api/reviews/analyze
Submit code for review (protected).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "code": "function example() { ... }",
  "language": "javascript",
  "skillLevel": "mid",
  "focusAreas": ["bugs", "security", "performance"]
}
```

**Response:**
```json
{
  "id": "review_id",
  "score": {
    "correctness": 75,
    "readability": 82,
    "maintainability": 70,
    "performance": 60,
    "security": 85,
    "overall": 74
  },
  "issues": [...],
  "improvedCode": "refactored_code",
  "mentorExplanation": "markdown_explanation",
  "followUpQuestions": [...],
  "createdAt": 1234567890
}
```

#### GET /api/reviews/history
Get user's review history (protected).

**Query Parameters:**
- `limit` (optional, default: 20, max: 100)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "reviews": [...],
  "stats": {
    "totalReviews": 42,
    "averageScore": 78,
    "languagesUsed": 3
  }
}
```

#### GET /api/reviews/:id
Get specific review (protected).

**Response:** Full review object with code and analysis.

#### DELETE /api/reviews/:id
Delete review (protected).

#### GET /api/reviews/stats/summary
Get user's review statistics (protected).

**Response:**
```json
{
  "totalReviews": 42,
  "averageScore": 78,
  "languagesUsed": 3,
  "recentReviews": [...]
}
```

### Health

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Flow

### OAuth2 Integration

1. **Frontend initiates OAuth flow** with Google/GitHub
2. **User authenticates** with OAuth provider
3. **Provider redirects** to frontend with authorization code
4. **Frontend sends code** to `/api/auth/login`
5. **Backend exchanges code** for user info with OAuth provider
6. **Backend finds or creates user** in database
7. **Backend generates JWT tokens** (access + refresh)
8. **Backend returns tokens** to frontend
9. **Frontend stores tokens** and uses access token for API calls

### JWT Tokens

**Access Token:**
- Expires: 24 hours
- Used for: All authenticated API calls
- Sent in: `Authorization: Bearer <token>` header

**Refresh Token:**
- Expires: 7 days
- Used for: Getting new access tokens
- Stored securely: In httpOnly cookies (recommended)

## Rate Limiting

### Code Review Endpoint
- **Limit:** 10 requests per minute per authenticated user
- **Window:** 1 minute
- **Response on limit:**
```json
{
  "error": "Too many code review requests. Please try again later.",
  "retryAfter": 60
}
```

### General API
- **Limit:** 100 requests per minute per IP
- **Window:** 1 minute

### Authentication Endpoints
- **Limit:** 5 attempts per 15 minutes per IP
- **Window:** 15 minutes

## Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```bash
# Edit .env with your values
nano .env
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment (development/production) | No | development |
| PORT | Server port | No | 5000 |
| DATABASE_URL | SQLite database path | No | ./reviews.db |
| AI_AGENT_URL | AI agent service URL | Yes | http://localhost:8000 |
| GROQ_API_KEY | Groq API key | Yes | - |
| JWT_SECRET | JWT signing secret | Yes | - |
| JWT_REFRESH_SECRET | Refresh token secret | Yes | - |
| OAUTH_CLIENT_ID | OAuth client ID | Yes | - |
| OAUTH_CLIENT_SECRET | OAuth client secret | Yes | - |
| OAUTH_REDIRECT_URI | OAuth callback URL | Yes | - |
| FRONTEND_URL | Frontend URL for CORS | No | http://localhost:5173 |

## Database

The backend uses SQLite with `better-sqlite3` for simplicity and performance.

### Features
- WAL mode for better concurrency
- Automatic indexing on frequently queried fields
- Cascade delete for user/review relationships

### Migrations
The database is auto-initialized on server start. Tables are created if they don't exist.

### Backups
The database file can be backed up by simply copying the `.db` file:
```bash
cp reviews.db reviews_backup.db
```

## Security Features

### Input Validation
- All inputs validated using `express-validator`
- Code length limits (10-50000 characters)
- Language whitelist
- Skill level validation
- Focus areas validation

### Rate Limiting
- Per-user rate limiting for code reviews
- IP-based rate limiting for auth
- Graceful responses with retry-after headers

### JWT Authentication
- Secure token generation
- Token expiration
- Protected routes with middleware
- Refresh token support

### CORS
- Configured to allow requests from frontend
- Credentials support for cookies
- Origin whitelisting

### Error Handling
- Centralized error handling
- No stack traces in production
- Standardized error responses
- Structured logging

## Logging

Uses Winston for structured logging.

### Log Levels
- `error`: Errors and exceptions
- `warn`: Warnings and potential issues
- `info`: General information (requests, responses)
- `debug`: Detailed debugging info (development only)

### Log Output
- Console (all environments)
- File (development only):
  - `logs/error.log` - Errors only
  - `logs/combined.log` - All logs

## Testing

Run the test suite:
```bash
npm test
```

## Development

### Code Style
- ES6+ syntax
- Async/await for async operations
- Arrow functions for callbacks
- Consistent error handling

### Adding New Routes

1. Create route file in `routes/`:
```javascript
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  // Your logic here
}));

export default router;
```

2. Import and mount in `server.js`:
```javascript
import newRoutes from './routes/newRoute.js';
app.use('/api/new', newRoutes);
```

### Error Handling

All async route handlers should use the `asyncHandler` wrapper:
```javascript
router.post('/', authenticate, asyncHandler(async (req, res) => {
  // Any errors thrown here will be caught
}));
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure proper OAuth credentials
- [ ] Set up reverse proxy (nginx, apache)
- [ ] Enable HTTPS
- [ ] Configure database backups
- [ ] Set up monitoring and alerting
- [ ] Configure process manager (PM2, systemd)

### Process Manager with PM2

```bash
npm install -g pm2

# Start server
pm2 start server.js --name ai-reviewer-backend

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart ai-reviewer-backend
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t ai-reviewer-backend .
docker run -p 5000:5000 --env-file .env ai-reviewer-backend
```

## Troubleshooting

### Database Locked Error
**Cause:** Multiple processes accessing database
**Solution:** Ensure WAL mode is enabled (enabled by default)

### AI Agent Unavailable
**Cause:** Python agent not running or wrong URL
**Solution:** Check AI_AGENT_URL and ensure agent is running

### Rate Limit Errors
**Cause:** Too many requests
**Solution:** Implement exponential backoff in frontend

### JWT Token Errors
**Cause:** Expired or invalid token
**Solution:** Implement token refresh logic in frontend

## License

MIT
