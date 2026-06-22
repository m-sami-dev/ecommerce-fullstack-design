import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const message = data ? Object.values(data).flat().join(' ') : 'Could not create your account.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Sign up to start shopping.</p>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Username">
            <input required value={form.username} onChange={handleChange('username')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="Email">
            <input required type="email" value={form.email} onChange={handleChange('email')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="Password">
            <input required type="password" minLength={6} value={form.password} onChange={handleChange('password')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </Field>
          <button
            disabled={loading}
            className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
        </p>
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
