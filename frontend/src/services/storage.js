/**
 * Local Storage Service
 * Helper functions for managing local storage
 */

export const storage = {
  /**
   * Get item from storage
   */
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting item from storage:', error)
      return null
    }
  },

  /**
   * Set item in storage
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error setting item in storage:', error)
      return false
    }
  },

  /**
   * Remove item from storage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing item from storage:', error)
      return false
    }
  },

  /**
   * Clear all storage
   */
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }
}

/**
 * Session storage helpers
 */
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting item from session storage:', error)
      return null
    }
  },

  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error setting item in session storage:', error)
      return false
    }
  },

  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing item from session storage:', error)
      return false
    }
  }
}
