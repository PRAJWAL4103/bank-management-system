import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirm: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success) {
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1800)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="glow-orb auth-orb-1" />
      <div className="glow-orb auth-orb-2" />

      <div className="auth-container auth-container-wide animate-fade-in">
        {/* Left Panel */}
        <div className="auth-panel auth-panel-left">
          <div className="auth-brand">
            <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.4rem' }}>N</div>
            <span className="logo-text" style={{ fontSize: '1.5rem' }}>NexaBank</span>
          </div>
          <h2 className="auth-panel-title">Start your financial journey today</h2>
          <p className="auth-panel-desc">Open a free account and get access to all NexaBank features instantly.</p>
          <div className="auth-features">
            <div className="auth-feature">✦ Savings & Current accounts</div>
            <div className="auth-feature">✦ Instant deposits & withdrawals</div>
            <div className="auth-feature">✦ Full transaction history</div>
            <div className="auth-feature">✦ Zero setup fees</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-panel auth-form-panel">
          <div className="auth-form-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="password_confirm"
                  className="form-input"
                  placeholder="Repeat password"
                  value={form.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
