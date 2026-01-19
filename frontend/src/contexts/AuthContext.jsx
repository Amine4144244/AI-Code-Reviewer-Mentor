import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const token = authService.getToken()
    if (token) {
      const userData = authService.getUser()
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const login = async (code, provider) => {
    try {
      const response = await authService.login(code, provider)
      authService.setToken(response.accessToken)
      authService.setRefreshToken(response.refreshToken)
      authService.setUser(response.user)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authService.clearTokens()
      setUser(null)
    }
  }

  const refreshSession = async () => {
    try {
      const refreshToken = authService.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await authService.refreshToken(refreshToken)
      authService.setToken(response.accessToken)
      return response
    } catch (error) {
      authService.clearTokens()
      setUser(null)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
