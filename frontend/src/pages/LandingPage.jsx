import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  { icon: '🔐', title: 'Bank-Grade Security', desc: 'JWT authentication, encrypted passwords, and secure session management protect your finances.' },
  { icon: '⚡', title: 'Instant Transfers', desc: 'Send money between accounts in real-time. No delays, no friction.' },
  { icon: '📊', title: 'Smart Dashboard', desc: 'Visualize your finances with live balance charts and transaction analytics.' },
  { icon: '🏦', title: 'Multi-Account', desc: 'Manage Savings and Current accounts all from one unified dashboard.' },
  { icon: '📱', title: 'Fully Responsive', desc: 'A seamless experience on desktop, tablet, and mobile.' },
  { icon: '💰', title: 'Zero Hidden Fees', desc: 'Transparent banking with no surprise charges on deposits or withdrawals.' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Glow orbs */}
      <div className="glow-orb orb-hero-1" />
      <div className="glow-orb orb-hero-2" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <div className="logo-icon">N</div>
            <span className="logo-text">NexaBank</span>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">✦ Modern Banking Redefined</div>
        <h1 className="hero-title">
          Banking that works<br />
          <span className="gradient-text">at the speed of life</span>
        </h1>
        <p className="hero-subtitle">
          NexaBank brings enterprise-grade banking to your fingertips. Manage accounts,
          send transfers, and track every transaction — beautifully.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Open an Account →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">₹0</div>
            <div className="hero-stat-label">Monthly Fees</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-value">256-bit</div>
            <div className="hero-stat-label">Encryption</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-value">24/7</div>
            <div className="hero-stat-label">Availability</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-header">
          <h2>Everything you need, <span className="gradient-text">nothing you don't</span></h2>
          <p>A complete banking platform built for the modern world.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card glass-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-inner glass-card">
          <h2>Ready to take control of your finances?</h2>
          <p>Join NexaBank today and experience banking built for the future.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 NexaBank. Built with Django + React.</p>
      </footer>
    </div>
  )
}
