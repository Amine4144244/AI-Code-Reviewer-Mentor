/**
 * AI Service
 * Handles communication with the Python AI agent
 */

import axios from 'axios';
import config from '../utils/config.js';
import logger from './logger.js';

/**
 * Call AI agent to analyze code
 */
export const analyzeCode = async (code, language, skillLevel = 'mid', focusAreas = []) => {
  try {
    const response = await axios.post(
      `${config.aiAgentUrl}/api/analyze`,
      {
        code,
        language,
        skillLevel,
        focusAreas
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info('Code analysis completed', {
      language,
      skillLevel,
      issuesFound: response.data.issues?.length || 0
    });

    return response.data;
  } catch (error) {
    logger.error('AI agent error:', {
      error: error.message,
      code: error.response?.status,
      url: `${config.aiAgentUrl}/api/analyze`
    });

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('AI agent service unavailable. Please ensure the Python agent is running.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      if (error.response?.status === 500) {
        throw new Error('AI agent encountered an internal error');
      }
    }

    throw new Error('Failed to analyze code');
  }
};

/**
 * Check AI agent health
 */
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${config.aiAgentUrl}/health`, {
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    logger.warn('AI agent health check failed:', { error: error.message });
    return { status: 'unhealthy', agent_ready: false };
  }
};
