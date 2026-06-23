import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

export default function Signup() {
  const { requestSignupOtp, verifySignupOtp } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await requestSignupOtp({ username: form.username, email: form.email, password: form.password })
      setInfo(`We sent a 4-digit code to ${form.email}.`)
      setStep('otp')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not start signup.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifySignupOtp(form.email, otp)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await requestSignupOtp({ username: form.username, email: form.email, password: form.password })
      setInfo('A new code has been sent.')
    } catch {
      setError('Could not resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        {step === 'form' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 mb-6">Sign up to start shopping.</p>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Field label="Username">
                <input required value={form.username} onChange={handleChange('username')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={handleChange('email')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </Field>
              <Field label="Password">
                <input required type="password" minLength={6} value={form.password} onChange={handleChange('password')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <PasswordStrengthMeter password={form.password} />
              </Field>
              <Field label="Confirm Password">
                <input required type="password" minLength={6} value={form.confirmPassword} onChange={handleChange('confirmPassword')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </Field>
              <button
                disabled={loading}
                className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60"
              >
                {loading ? 'Sending code...' : 'Sign up'}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email</h1>
            <p className="text-sm text-gray-500 mb-6">{info}</p>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {info && step === 'otp' && !error && (
              <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mb-4">{info}</p>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Field label="4-digit code">
                <input
                  required
                  maxLength={4}
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-xl tracking-[0.5em] font-semibold"
                  placeholder="0000"
                />
              </Field>
              <button
                disabled={loading || otp.length !== 4}
                className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify & create account'}
              </button>
            </form>

            <button onClick={handleResend} disabled={loading} className="text-sm text-brand-600 hover:underline mt-4 block mx-auto">
              Resend code
            </button>
            <button onClick={() => setStep('form')} className="text-sm text-gray-400 hover:underline mt-2 block mx-auto">
              ← Edit details
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}