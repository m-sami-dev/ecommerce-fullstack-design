import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const applySession = useCallback((data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    applySession(data)
    return data.user
  }, [applySession])

  // Step 1 of signup: send signup details, triggers an OTP email
  const requestSignupOtp = useCallback(async (payload) => {
    await api.post('/auth/signup/request-otp/', payload)
  }, [])

  // Step 2 of signup: verify the OTP, which creates the account and logs in
  const verifySignupOtp = useCallback(async (email, otp) => {
    const { data } = await api.post('/auth/signup/verify-otp/', { email, otp })
    applySession(data)
    return data.user
  }, [applySession])

  const requestPasswordReset = useCallback(async (email) => {
    await api.post('/auth/password-reset/request/', { email })
  }, [])

  const confirmPasswordReset = useCallback(async (email, token, newPassword) => {
    await api.post('/auth/password-reset/confirm/', { email, token, new_password: newPassword })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user, login, logout, isAuthenticated: !!user,
        requestSignupOtp, verifySignupOtp,
        requestPasswordReset, confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}