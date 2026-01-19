# Setup Guide

This guide will help you set up the AI Code Reviewer & Mentor application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Python** 3.9 or higher ([Download](https://www.python.org/downloads/))
- **npm** (comes with Node.js)
- **pip** (comes with Python)
- **Groq API Key** ([Get free API key](https://console.groq.com/keys))

## Step-by-Step Setup

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Save it securely - you'll need it for the AI agent

### 2. Set Up the AI Agent (Python)

Navigate to the ai-agent directory:

```bash
cd ai-agent
```

Create a virtual environment (recommended):

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Set the Groq API key:

```bash
# On macOS/Linux:
export GROQ_API_KEY=your_actual_api_key_here

# On Windows (PowerShell):
$env:GROQ_API_KEY="your_actual_api_key_here"

# On Windows (Command Prompt):
set GROQ_API_KEY=your_actual_api_key_here
```

Start the AI agent server:

```bash
python -m ai-agent.server
```

The server will start on `http://localhost:8000`

**Keep this terminal open** and verify it's running by visiting http://localhost:8000/health in your browser. You should see:
```json
{
  "status": "healthy",
  "agent_ready": true
}
```

### 3. Set Up the Backend (Node.js)

Open a **new terminal** and navigate to the backend directory:

```bash
cd backend
```

Install Node.js dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Groq API key:

```bash
# Using nano (macOS/Linux):
nano .env

# Using notepad (Windows):
notepad .env
```

Update the following line:
```env
GROQ_API_KEY=your_actual_api_key_here
```

You can also keep the default values for other settings in development.

Start the backend server:

```bash
npm start
```

The server will start on `http://localhost:5000`

**Keep this terminal open** and verify it's running by visiting http://localhost:5000/health in your browser. You should see:
```json
{
  "status": "healthy",
  "environment": "development",
  "timestamp": "..."
}
```

### 4. Set Up the Frontend (React)

Open a **third terminal** and navigate to the frontend directory:

```bash
cd frontend
```

Install Node.js dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

The default `.env` file should work for local development:
```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Accessing the Application

1. Open your browser and go to: `http://localhost:5173`
2. Click **"Try Demo Mode"** to start using the application without OAuth setup
3. Paste some code into the editor
4. Select your programming language and skill level
5. Choose focus areas (bugs, security, performance, etc.)
6. Click **"Analyze Code"** to get your review

## Troubleshooting

### AI Agent Won't Start

**Problem**: `ModuleNotFoundError: No module named 'flask'`

**Solution**: Make sure you installed the requirements:
```bash
pip install -r requirements.txt
```

**Problem**: `GROQ_API_KEY not set`

**Solution**: Set the environment variable before starting:
```bash
export GROQ_API_KEY=your_key_here
```

### Backend Won't Start

**Problem**: `ECONNREFUSED` when calling AI agent

**Solution**: Make sure the AI agent is running on port 8000. Check that terminal.

**Problem**: Database locked error

**Solution**: This is usually fixed by restarting the backend server.

### Frontend Won't Start

**Problem**: `VITE_API_URL is not defined`

**Solution**: Make sure you created the `.env` file in the frontend directory.

**Problem**: Can't connect to backend

**Solution**: Make sure the backend is running on port 5000.

### Code Review Errors

**Problem**: "AI agent service unavailable"

**Solution**:
1. Check that AI agent terminal is still running
2. Visit http://localhost:8000/health to verify it's healthy
3. Restart the AI agent server if needed

**Problem**: "Too many requests" error

**Solution**: Wait a minute before trying again (rate limiting is 10 reviews/minute).

## Development Tips

### Running All Services Simultaneously

To run all services with one command, use a tool like `concurrently`:

1. Install in the root directory:
```bash
npm install -g concurrently
```

2. Create a start script or use separate terminals as shown above.

### Viewing Logs

- **AI Agent**: Check the terminal where you ran `python -m ai-agent.server`
- **Backend**: Check the terminal where you ran `npm start`
- **Frontend**: Check the browser console for errors

### Hot Reload

- **Frontend**: Vite supports hot reload - changes appear automatically
- **Backend**: Use `npm run dev` instead of `npm start` for auto-restart
- **AI Agent**: Restart manually after code changes

## Production Deployment

For production deployment, refer to the main README.md for:
- Environment variable security
- Process managers (PM2, systemd)
- Reverse proxy configuration (nginx)
- HTTPS setup
- Database backups

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Ensure all three services are running (AI agent, backend, frontend)
3. Verify your Groq API key is valid
4. Check that ports 8000, 5000, and 5173 are not already in use
5. Review the README files in each service directory

## Next Steps

Once everything is running:

1. Try the demo mode with sample code
2. Review the architecture documentation
3. Explore the codebase
4. Consider adding your own detectors to the AI agent
5. Customize the frontend design

Happy coding! 🚀
