# AI Code Reviewer & Mentor 🤖

A production-ready code review application that functions as a strict senior developer mentor. The system analyzes code submissions and provides detailed, honest feedback explaining not just what is wrong, but **why**, what risks it introduces, and **how a senior engineer would approach it differently**.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)
![React](https://img.shields.io/badge/React-18-cyan.svg)

## ✨ Features

### 🎯 Core Capabilities
- **Comprehensive Code Analysis**: Detects bugs, security vulnerabilities, performance issues, and code smells
- **Senior-Level Mentorship**: Provides detailed explanations of why issues matter and how to fix them
- **Multi-Language Support**: JavaScript, TypeScript, Python, Go, Java, C++, C
- **Adaptive Feedback**: Adjusts explanations based on developer skill level (junior, mid, senior)
- **Focus Areas**: Target specific aspects like bugs, security, performance, or clean code

### 🤖 AI-Powered
- **Rule-Based Detectors**: Fast pattern matching for common issues
- **LLM Analysis**: Deep code understanding using Groq API
- **Intelligent Scoring**: Evaluates code across 5 dimensions (correctness, readability, maintainability, performance, security)
- **Improved Code Generation**: Provides refactored versions with explanations
- **Follow-up Questions**: Provokes deeper thinking about design decisions

### 🔐 Production Ready
- **OAuth Authentication**: Google and GitHub login
- **JWT Security**: Access and refresh token management
- **Rate Limiting**: Prevents abuse (10 reviews/minute)
- **Input Validation**: Comprehensive sanitization
- **Error Handling**: Graceful fallbacks with meaningful messages
- **Structured Logging**: Winston-based logging for monitoring

### 💻 Modern UI
- **React 18 + Vite**: Fast development and production builds
- **Monaco Editor**: Professional code editing experience
- **Dark Mode**: Eye-friendly interface with localStorage persistence
- **Responsive Design**: Works on desktop and tablet
- **Real-time Feedback**: Live character counting and validation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                   (React + Vite + JS)                       │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │ Login Page │  │ Dashboard  │  │   History Page        │ │
│  └────────────┘  └────────────┘  └──────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│                  (Node.js + Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth Routes  │  │ Review Routes│  │  Middleware      │  │
│  │ (OAuth/JWT)  │  │ (Analyze)    │  │ (Rate Limiting)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                         │                                     │
│                  ┌──────▼──────┐                              │
│                  │   SQLite    │                              │
│                  │  Database   │                              │
│                  └─────────────┘                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         AI Agent                            │
│                    (Python + Groq)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Detectors   │  │   LLM        │  │   Scoring        │  │
│  │ (Rule-based) │  │  Analysis    │  │   System         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Groq API   │
                    │ (mixtral-8x7b)│
                    └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- Python 3.9 or higher
- Groq API key ([Get one free](https://groq.com))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-code-reviewer
```

2. **Install Python dependencies (AI Agent)**
```bash
cd ai-agent
pip install -r requirements.txt
export GROQ_API_KEY=your_groq_api_key
python -m ai-agent.server &
cd ..
```

The AI agent will start on `http://localhost:8000`

3. **Install Node.js dependencies (Backend)**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start &
cd ..
```

The backend will start on `http://localhost:5000`

4. **Install Node.js dependencies (Frontend)**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at `http://localhost:5173`

5. **Access the application**
Open your browser to `http://localhost:5173` and use the "Demo Mode" to try it without OAuth setup.

## 📁 Project Structure

```
ai-code-reviewer/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and storage
│   │   ├── contexts/      # React contexts
│   │   └── styles/        # CSS and Tailwind
│   └── package.json
│
├── backend/               # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utilities
│   └── server.js
│
├── ai-agent/              # Python AI agent
│   ├── agent.py           # Main orchestration
│   ├── detectors.py       # Pattern detectors
│   ├── prompts.py         # Prompt templates
│   ├── scoring.py         # Scoring system
│   └── server.py          # Flask server
│
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (`.env`)**
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=./reviews.db
AI_AGENT_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env`)**
```bash
VITE_API_URL=http://localhost:5000
VITE_OAUTH_CLIENT_ID=your_oauth_client_id
```

**AI Agent (`.env`)**
```bash
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - OAuth login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Code Reviews
- `POST /api/reviews/analyze` - Submit code for review
- `GET /api/reviews/history` - Get review history
- `GET /api/reviews/:id` - Get specific review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/stats/summary` - Get statistics

### AI Agent
- `POST /api/analyze` - Analyze code (internal)
- `GET /health` - Health check
- `POST /api/validate` - Validate API key

## 🎨 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - Professional code editor
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **SQLite (better-sqlite3)** - Embedded database
- **JWT** - Authentication tokens
- **Express-rate-limit** - Rate limiting
- **Winston** - Structured logging

### AI Agent
- **Python 3.9+** - Runtime environment
- **Flask** - Web framework
- **Groq API** - Fast LLM inference
- **Mixtral 8x7B** - High-quality model

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# AI Agent tests (if added)
cd ai-agent
pytest
```

## 📈 Performance

- **Analysis Time**: 2-5 seconds per review
- **Rate Limiting**: 10 reviews/minute per user
- **Database**: SQLite with WAL mode for concurrency
- **LLM Cost**: ~$0.001 per review (Groq pricing)

## 🔒 Security

- ✅ OAuth2 authentication (Google/GitHub)
- ✅ JWT token-based authorization
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React auto-escapes)

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure production OAuth credentials
- [ ] Enable HTTPS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure database backups
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure process manager (PM2, systemd)

### Docker Deployment

```dockerfile
# Example for backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
CMD ["node", "server.js"]
```

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation
- [AI Agent README](./ai-agent/README.md) - Detector details and extension guide

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌟 Why This Project?

This project demonstrates:

- **Full-Stack Development**: Frontend, backend, and AI integration
- **Modern Architecture**: Microservices with clear separation of concerns
- **AI Integration**: Practical use of LLMs for code analysis
- **Production Quality**: Error handling, logging, rate limiting, validation
- **Senior Engineering Thinking**: Clean code, SOLID principles, extensibility
- **Real-World Application**: Solves an actual problem developers face

Perfect for:
- 🎓 Learning full-stack development
- 💼 Portfolio showcase
- 🚀 Production deployment
- 📚 Open source contributions
- 🔬 AI experimentation

## 🔗 Links

- [Groq Documentation](https://console.groq.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Monaco Editor](https://microsoft.github.io/monaco-editor)

## 💡 Future Enhancements

- [ ] Real-time collaboration
- [ ] Code comparison with git history
- [ ] Team features and shared reviews
- [ ] Custom rule configuration
- [ ] Integration with CI/CD pipelines
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] Support for more languages
- [ ] Automated test generation

---

**Built with ❤️ for developers who want to improve their craft**
