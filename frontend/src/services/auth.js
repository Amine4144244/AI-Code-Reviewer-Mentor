import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Login with OAuth code
 */
export const login = async (code, provider) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    code,
    provider
  })
  return response.data
}

/**
 * Logout
 */
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/api/auth/logout`)
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * Refresh token
 */
export const refreshToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}/api/auth/refresh`, {
    refreshToken
  })
  return response.data
}

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const token = getToken()
  if (!token) {
    throw new Error('No token found')
  }

  const response = await axios.get(`${API_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response.data
}

// Token storage helpers
export const setToken = (token) => {
  localStorage.setItem('accessToken', token)
}

export const getToken = () => {
  return localStorage.getItem('accessToken')
}

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token)
}

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export const isAuthenticated = () => {
  return !!getToken()
}
