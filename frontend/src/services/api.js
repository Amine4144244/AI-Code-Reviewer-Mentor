import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Submit code for review
 */
export const submitCodeReview = async (data) => {
  const response = await api.post('/reviews/analyze', data)
  return response.data
}

/**
 * Get review history
 */
export const getReviewHistory = async (params = {}) => {
  const response = await api.get('/reviews/history', { params })
  return response.data
}

/**
 * Get specific review
 */
export const getReview = async (id) => {
  const response = await api.get(`/reviews/${id}`)
  return response.data
}

/**
 * Delete review
 */
export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`)
  return response.data
}

/**
 * Get review statistics
 */
export const getReviewStats = async () => {
  const response = await api.get('/reviews/stats/summary')
  return response.data
}

export default api
