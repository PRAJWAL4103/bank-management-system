import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/transactions', label: 'Transactions', icon: '↔' },
  { to: '/deposit', label: 'Deposit', icon: '↓' },
  { to: '/withdraw', label: 'Withdraw', icon: '↑' },
  { to: '/transfer', label: 'Transfer', icon: '⇄' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/dashboard" className="navbar-logo">
          <div className="logo-icon">N</div>
          <span className="logo-text">NexaBank</span>
        </NavLink>

        {/* Desktop links */}
        <ul className="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `navbar-link${isActive ? ' navbar-link--active' : ''}`
                }
              >
                <span className="link-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="navbar-right">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `mobile-link${isActive ? ' mobile-link--active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
          <button className="btn btn-danger btn-sm mobile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
