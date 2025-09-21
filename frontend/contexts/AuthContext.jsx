'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is logged in
        if (authApi.isAuthenticated()) {
          const userData = authApi.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authApi.login(email, password)
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authApi.register(userData)
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, message: response.message || 'Registration failed' }
      }
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
