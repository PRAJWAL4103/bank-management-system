import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { accountsApi, transactionsApi } from '../api/client'
import './TransactionForms.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

export default function DepositPage() {
  const [searchParams] = useSearchParams()
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({
    account_number: searchParams.get('account') || '',
    amount: '',
    description: 'Deposit'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    accountsApi.list().then(res => setAccounts(res.data.data || [])).catch(() => {})
  }, [])

  const selectedAccount = accounts.find(a => a.account_number === form.account_number)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount greater than zero.')
      return
    }
    setLoading(true)
    try {
      const res = await transactionsApi.deposit({
        account_number: form.account_number,
        amount: parseFloat(form.amount),
        description: form.description || 'Deposit'
      })
      setResult(res.data.data)
      setForm(f => ({ ...f, amount: '', description: 'Deposit' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="txn-form-wrapper">
        <div className="page-header">
          <h1 className="page-title">Deposit Funds</h1>
          <p className="page-subtitle">Add money to your account instantly</p>
        </div>

        <div className="txn-form-grid">
          {/* Form */}
          <div className="glass-card txn-form-card">
            <div className="txn-icon-header">
              <div className="txn-icon txn-icon-green">↓</div>
              <div>
                <h3 className="txn-form-title">Make a Deposit</h3>
                <p className="txn-form-sub">Funds are credited instantly</p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {result && (
              <div className="alert alert-success txn-success">
                <div>✓ Deposit Successful!</div>
                <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  <span style={{ marginRight: 16 }}>Txn: <strong>{result.transaction_id}</strong></span>
                  <span>New Balance: <strong>{formatCurrency(result.new_balance)}</strong></span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="txn-form">
              <div className="form-group">
                <label className="form-label">Select Account</label>
                <select
                  id="deposit-account"
                  name="account_number"
                  className="form-select"
                  value={form.account_number}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Choose an account —</option>
                  {accounts.filter(a => a.status === 'Active').map(a => (
                    <option key={a.account_number} value={a.account_number}>
                      {a.account_type} •••• {a.account_number.slice(-4)} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  id="deposit-amount"
                  type="number"
                  name="amount"
                  className="form-input amount-input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  id="deposit-description"
                  type="text"
                  name="description"
                  className="form-input"
                  placeholder="e.g. Salary credit"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <button
                id="deposit-submit"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || !form.account_number}
              >
                {loading ? 'Processing...' : `Deposit${form.amount ? ' ' + formatCurrency(form.amount) : ''}`}
              </button>
            </form>
          </div>

          {/* Info panel */}
          <div className="txn-info-panel">
            {selectedAccount ? (
              <div className="glass-card txn-account-preview">
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-accent)', fontWeight: 700 }}>
                  {selectedAccount.account_type} Account
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {selectedAccount.account_number}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginTop: 16 }}>
                  {formatCurrency(selectedAccount.balance)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>Current Balance</div>
                {form.amount && parseFloat(form.amount) > 0 && (
                  <div style={{ marginTop: 20, padding: 16, background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>After Deposit</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                      {formatCurrency(parseFloat(selectedAccount.balance) + parseFloat(form.amount))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card txn-account-preview" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏦</div>
                <p>Select an account to see details</p>
              </div>
            )}

            <div className="glass-card txn-tips">
              <h4>Deposit Info</h4>
              <ul>
                <li>Funds are credited instantly</li>
                <li>No minimum deposit amount</li>
                <li>Only Active accounts can receive deposits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
