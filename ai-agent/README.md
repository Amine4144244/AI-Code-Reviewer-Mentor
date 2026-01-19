# AI Code Reviewer & Mentor Agent

A Python-based AI agent that provides comprehensive code reviews with senior-level mentorship feedback. Powered by Groq for fast, cost-effective inference.

## Architecture

The agent follows a modular architecture:

```
ai-agent/
├── agent.py          # Main orchestration logic
├── prompts.py        # Sophisticated prompt templates
├── scoring.py        # Code quality scoring system
├── detectors.py      # Rule-based pattern detectors
├── server.py         # Flask HTTP server
└── requirements.txt  # Python dependencies
```

### Core Components

**CodeReviewAgent** (`agent.py`)
- Orchestrates the entire analysis pipeline
- Combines rule-based detectors with LLM analysis
- Generates mentor-style explanations
- Manages Groq API integration

**Detectors** (`detectors.py`)
- `BugDetector`: Logic errors, null pointer risks, edge cases
- `AntiPatternDetector`: Code smells, deep nesting, duplication
- `SecurityDetector`: SQL injection, XSS, hardcoded secrets
- `PerformanceDetector`: N+1 queries, inefficient loops, memory leaks
- `CleanCodeDetector`: Long lines, commented code, SOLID violations

**Scoring System** (`scoring.py`)
- Evaluates code across 5 dimensions:
  - Correctness
  - Readability
  - Maintainability
  - Performance
  - Security
- Calculates overall score (0-100)
- Provides letter grades (A-F)

**Prompt Engineering** (`prompts.py`)
- System prompts enforce "strict senior mentor" persona
- Context-aware prompts based on skill level
- Structured JSON output for reliable parsing
- Focus-area-specific guidance

## How It Works

### Analysis Pipeline

1. **Input Validation**: Parse and validate code and parameters
2. **Rule-Based Detection**: Run all detectors to find obvious issues
3. **LLM Analysis**: Use Groq for deeper insights and code improvements
4. **Score Calculation**: Compute scores across all dimensions
5. **Mentor Explanation**: Generate markdown-formatted feedback
6. **Follow-up Questions**: Create thought-provoking questions

### Response Format

```json
{
  "score": {
    "correctness": 75,
    "readability": 82,
    "maintainability": 70,
    "performance": 60,
    "security": 85,
    "overall": 74
  },
  "issues": [
    {
      "line": 5,
      "severity": "error|warning|info",
      "category": "bug|performance|security|clean-code|anti-pattern",
      "message": "Explanation of the issue",
      "explanation": "Why this is a problem and what risks it introduces",
      "suggestion": "How a senior engineer would fix this"
    }
  ],
  "improvedCode": "Full refactored code as string",
  "mentorExplanation": "Markdown-formatted explanation",
  "followUpQuestions": [
    "Why did you choose this data structure?",
    "What happens if this function is called concurrently?"
  ]
}
```

## Detector Details

### BugDetector
Detects common programming errors:
- Null/undefined access without checks
- Async operations without error handling
- Type coercion bugs (== vs ===)
- Dictionary key errors
- Off-by-one errors in loops
- Infinite loops

### AntiPatternDetector
Identifies code smells:
- Deep nesting (>4 levels)
- Code duplication
- Long functions (>50 lines)
- Magic numbers
- Poor variable naming

### SecurityDetector
Finds security vulnerabilities:
- SQL injection risks
- XSS vulnerabilities (innerHTML, eval)
- Hardcoded secrets (API keys, passwords)
- Weak cryptographic algorithms
- Auth bypass risks

### PerformanceDetector
Detects performance issues:
- N+1 query problems
- Inefficient loops
- Memory leaks (uncleaned event listeners)
- Unnecessary operations

### CleanCodeDetector
Checks code quality:
- Long lines (>120 chars)
- Commented-out code
- Dead/unreachable code
- SOLID principle violations

## Prompt Engineering Approach

### System Persona
The system prompt establishes a "strict senior mentor" with 15+ years of experience who:
- Is direct and honest
- Explains the "why" behind critiques
- Highlights real-world risks
- Suggests senior-level solutions
- Balances criticism with guidance

### Skill-Level Adaptation
Prompts adapt based on target skill level:

**Junior**: Detailed explanations, educational context, resource suggestions
**Mid**: Architectural discussions, pattern guidance, edge case consideration
**Senior**: Rigorous critique, operational concerns, production-ready standards

### Structured Output
All LLM responses use strict JSON schema for reliable parsing:
- Defined issue structure
- Type-enforced fields
- Enum-restricted values (severity, category)

## Scoring Methodology

### Base Scoring
- Each dimension starts at 100
- Deductions based on issue severity:
  - Error: -15 points
  - Warning: -8 points
  - Info: -3 points

### Category Impact
Different issues affect specific dimensions:
- Bug: Correctness (1.5x), Security (0.5x)
- Security: Security (2.0x), Correctness (0.5x)
- Performance: Performance (1.5x)
- Clean Code: Readability (1.0x), Maintainability (1.0x)
- Anti-pattern: Maintainability (1.5x), Readability (0.5x)

### LLM Adjustment
LLM quality assessment provides additional +/- adjustments based on qualitative analysis.

## API Endpoints

### POST /api/analyze
Analyze code and return comprehensive review.

**Request:**
```json
{
  "code": "function example() { ... }",
  "language": "javascript",
  "skillLevel": "mid",
  "focusAreas": ["bugs", "security", "performance"]
}
```

**Response:** See Response Format above

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "agent_ready": true
}
```

### POST /api/validate
Validate Groq API key.

**Request:**
```json
{
  "apiKey": "gsk_..."
}
```

**Response:**
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

## Environment Variables

```bash
GROQ_API_KEY=your_groq_api_key
PORT=8000
DEBUG=False
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export GROQ_API_KEY=your_api_key
```

3. Run the server:
```bash
python -m ai-agent.server
```

The server will start on `http://localhost:8000`

## Extending the Agent

### Adding a New Detector

1. Create a new detector class inheriting from `BaseDetector`:

```python
class MyDetector(BaseDetector):
    def detect(self, code, language, lines):
        issues = []
        # Your detection logic here
        return issues
```

2. Add it to the `CodeReviewAgent` initialization in `agent.py`:

```python
self.my_detector = MyDetector()
```

3. Add it to the `_run_detectors` method:

```python
if "my-category" in focus_areas:
    issues.extend(self.my_detector.detect(code, language, lines))
```

### Adding a New Language

1. Add language to `supported_languages` in `server.py`
2. Add language-specific patterns to detectors
3. Test thoroughly with language-specific code samples

### Customizing Prompts

Edit `prompts.py` to modify:
- System persona
- Skill-level guidance
- Analysis instructions
- Output format

## Testing

Run the test suite:

```bash
pytest tests/
```

Run with coverage:

```bash
pytest --cov=ai-agent tests/
```

## Performance

- **Inference Time**: ~2-5 seconds per review
- **Rate Limiting**: Handled by backend (10 reviews/minute)
- **Cost**: Groq is ~10x cheaper than GPT-4 with comparable quality
- **Model**: mixtral-8x7b-32768 for fast, accurate results

## Why This Design?

### Two-Phase Approach
Combining rule-based detectors with LLM analysis provides:
- **Fast detection** of obvious issues (rule-based)
- **Deep understanding** of complex patterns (LLM)
- **Cost efficiency** by reducing LLM token usage
- **Consistent results** from rule-based checks

### Senior Mentor Persona
The "strict senior mentor" approach ensures:
- Actionable feedback that improves skills
- Real-world context and risk awareness
- Growth-oriented criticism
- Concrete, implementable solutions

### Modular Architecture
- Easy to extend with new detectors
- Simple to swap LLM providers
- Clear separation of concerns
- Testable components

## Troubleshooting

### Agent Not Initialized
**Error**: "AI agent not initialized. Please set GROQ_API_KEY."
**Solution**: Set `GROQ_API_KEY` environment variable

### Slow Responses
**Cause**: Groq API rate limits or network issues
**Solution**: Check Groq status, implement retries, reduce code size

### False Positives
**Cause**: Rule-based detectors can be overly sensitive
**Solution**: Fine-tune detector patterns, add whitelist functionality

## License

MIT
