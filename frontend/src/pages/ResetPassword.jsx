import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

export default function ResetPassword() {
  const { confirmPasswordReset } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!email || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">This reset link is invalid or incomplete.</p>
        <Link to="/forgot-password" className="text-brand-600 hover:underline">Request a new link</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await confirmPasswordReset(email, token, password)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'This link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">Setting a new password for {email}.</p>

        {done ? (
          <>
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mb-4">
              Password reset successful! You can now log in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600"
            >
              Go to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <PasswordStrengthMeter password={password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                required
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}