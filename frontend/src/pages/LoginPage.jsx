import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glow-orb auth-orb-1" />
      <div className="glow-orb auth-orb-2" />

      <div className="auth-container animate-fade-in">
        {/* Left Panel */}
        <div className="auth-panel auth-panel-left">
          <div className="auth-brand">
            <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>N</div>
            <span className="logo-text" style={{ fontSize: '1.5rem' }}>NexaBank</span>
          </div>
          <h2 className="auth-panel-title">Welcome back to smarter banking</h2>
          <p className="auth-panel-desc">Manage accounts, transfer funds, and track every transaction seamlessly.</p>
          <div className="auth-features">
            <div className="auth-feature">✦ Real-time balance updates</div>
            <div className="auth-feature">✦ Instant fund transfers</div>
            <div className="auth-feature">✦ Bank-grade security</div>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="auth-panel auth-form-panel">
          <div className="auth-form-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
