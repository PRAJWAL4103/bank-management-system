import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { accountsApi } from '../api/client'
import './AccountsPage.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

const STATUS_BADGE = { Active: 'badge-success', Blocked: 'badge-danger', Closed: 'badge-warning' }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [accountType, setAccountType] = useState('Savings')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const res = await accountsApi.list()
      setAccounts(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAccounts() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      await accountsApi.create({ account_type: accountType })
      setSuccess(`${accountType} account created successfully!`)
      setShowForm(false)
      fetchAccounts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account')
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading accounts...</p>
      </div>
    )
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header flex justify-between items-center flex-wrap gap-md">
          <div>
            <h1 className="page-title">My Accounts</h1>
            <p className="page-subtitle">Manage your bank accounts</p>
          </div>
          <button
            id="open-account-btn"
            className="btn btn-primary"
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          >
            {showForm ? '✕ Cancel' : '+ Open New Account'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="glass-card create-form animate-fade-in">
            <h3>Open a New Account</h3>
            <p className="text-muted text-sm">Each user can have one Savings and one Current account.</p>
            {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
            <form onSubmit={handleCreate} className="create-form-body">
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  id="account-type-select"
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                </select>
              </div>
              <button id="create-account-submit" type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {success && <div className="alert alert-success animate-fade-in">{success}</div>}

        {/* Account cards */}
        {accounts.length === 0 ? (
          <div className="glass-card empty-state" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏦</div>
            <h3>No accounts yet</h3>
            <p className="text-muted text-sm" style={{ marginTop: 8, marginBottom: 24 }}>
              Click "Open New Account" to create your first bank account.
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Open an Account</button>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((acc) => (
              <div key={acc.id} className="acc-card glass-card">
                <div className="acc-card-header">
                  <div className="acc-type-label">{acc.account_type}</div>
                  <span className={`badge ${STATUS_BADGE[acc.status]}`}>{acc.status}</span>
                </div>
                <div className="acc-number">Account No.</div>
                <div className="acc-number-value">{acc.account_number}</div>
                <div className="acc-balance">{formatCurrency(acc.balance)}</div>
                <div className="acc-footer">
                  <span className="text-xs text-muted">
                    Opened {new Date(acc.created_at).toLocaleDateString('en-IN')}
                  </span>
                  <Link to={`/accounts/${acc.account_number}`} className="btn btn-secondary btn-sm">
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
