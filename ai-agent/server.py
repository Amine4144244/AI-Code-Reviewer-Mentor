"""
Flask server for the AI Code Reviewer & Agent.
Exposes HTTP endpoints for the Node.js backend to call.
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from .agent import create_agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Get API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set in environment variables")

# Create agent instance
agent = create_agent(GROQ_API_KEY) if GROQ_API_KEY else None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "agent_ready": agent is not None
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    """
    Analyze code and return comprehensive review.

    Request body:
    {
        "code": string,
        "language": string,
        "skillLevel": string (junior|mid|senior),
        "focusAreas": string[] (bugs|performance|security|clean-code|all)
    }

    Response:
    {
        "score": {...},
        "issues": [...],
        "improvedCode": string,
        "mentorExplanation": string,
        "followUpQuestions": [...]
    }
    """
    if not agent:
        return jsonify({
            "error": "AI agent not initialized. Please set GROQ_API_KEY."
        }), 500

    try:
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        code = data.get('code')
        language = data.get('language')
        skill_level = data.get('skillLevel', 'mid')
        focus_areas = data.get('focusAreas', ['bugs', 'performance', 'security', 'clean-code'])

        # Validate code
        if not code:
            return jsonify({"error": "Code is required"}), 400

        if not isinstance(code, str):
            return jsonify({"error": "Code must be a string"}), 400

        if len(code) > 50000:  # Limit code size
            return jsonify({"error": "Code too large (max 50000 characters)"}), 400

        # Validate language
        supported_languages = ['javascript', 'typescript', 'python', 'go', 'java', 'cpp', 'c']
        if language and language.lower() not in supported_languages:
            return jsonify({
                "error": f"Unsupported language. Supported: {', '.join(supported_languages)}"
            }), 400

        # Normalize language
        language = language.lower() if language else 'javascript'

        # Validate skill level
        if skill_level not in ['junior', 'mid', 'senior']:
            return jsonify({
                "error": "Invalid skill level. Must be: junior, mid, or senior"
            }), 400

        # Validate focus areas
        valid_areas = ['bugs', 'performance', 'security', 'clean-code', 'all']
        for area in focus_areas:
            if area not in valid_areas:
                return jsonify({
                    "error": f"Invalid focus area: {area}. Must be one of: {', '.join(valid_areas)}"
                }), 400

        logger.info(f"Analyzing {language} code for {skill_level} developer")

        # Perform analysis
        result = agent.analyze(code, language, skill_level, focus_areas)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        return jsonify({
            "error": "Internal server error during code analysis",
            "details": str(e)
        }), 500


@app.route('/api/validate', methods=['POST'])
def validate_setup():
    """
    Validate that the AI agent is properly configured.

    Request body:
    {
        "apiKey": string
    }

    Response:
    {
        "valid": boolean,
        "message": string
    }
    """
    try:
        data = request.get_json()
        api_key = data.get('apiKey')

        if not api_key:
            return jsonify({"valid": False, "message": "API key is required"}), 400

        # Test the API key by making a simple request
        test_client = Groq(api_key=api_key)
        response = test_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": "test"}],
            max_tokens=5
        )

        return jsonify({
            "valid": True,
            "message": "API key is valid"
        }), 200

    except Exception as e:
        logger.error(f"API key validation failed: {str(e)}")
        return jsonify({
            "valid": False,
            "message": f"Invalid API key: {str(e)}"
        }), 400


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'

    logger.info(f"Starting AI Agent server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
