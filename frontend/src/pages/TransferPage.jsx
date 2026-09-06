import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { accountsApi, transactionsApi } from '../api/client'
import './TransactionForms.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

export default function TransferPage() {
  const [searchParams] = useSearchParams()
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({
    sender_account: searchParams.get('from') || '',
    receiver_account: '',
    amount: '',
    description: 'Transfer'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    accountsApi.list().then(res => setAccounts(res.data.data || [])).catch(() => {})
  }, [])

  const senderAccount = accounts.find(a => a.account_number === form.sender_account)
  const insufficientFunds = form.amount && senderAccount && parseFloat(form.amount) > parseFloat(senderAccount.balance)
  const sameAccount = form.sender_account && form.receiver_account && form.sender_account === form.receiver_account

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (sameAccount) { setError('Cannot transfer to the same account.'); return }
    if (insufficientFunds) { setError('Insufficient balance in sender account.'); return }
    setLoading(true)
    try {
      const res = await transactionsApi.transfer({
        sender_account: form.sender_account,
        receiver_account: form.receiver_account,
        amount: parseFloat(form.amount),
        description: form.description || 'Transfer'
      })
      setResult(res.data.data)
      setForm(f => ({ ...f, receiver_account: '', amount: '', description: 'Transfer' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="txn-form-wrapper">
        <div className="page-header">
          <h1 className="page-title">Transfer Funds</h1>
          <p className="page-subtitle">Send money between accounts instantly</p>
        </div>

        <div className="txn-form-grid">
          <div className="glass-card txn-form-card">
            <div className="txn-icon-header">
              <div className="txn-icon txn-icon-blue">⇄</div>
              <div>
                <h3 className="txn-form-title">Fund Transfer</h3>
                <p className="txn-form-sub">Transfer to any NexaBank account</p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {result && (
              <div className="alert alert-success txn-success">
                <div>✓ Transfer Successful!</div>
                <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  Txn: <strong>{result.transaction_id}</strong>&nbsp;&nbsp;
                  New Balance: <strong>{formatCurrency(result.sender_new_balance)}</strong>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="txn-form">
              <div className="form-group">
                <label className="form-label">From Account</label>
                <select
                  id="transfer-from"
                  name="sender_account"
                  className="form-select"
                  value={form.sender_account}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select your account —</option>
                  {accounts.filter(a => a.status === 'Active').map(a => (
                    <option key={a.account_number} value={a.account_number}>
                      {a.account_type} •••• {a.account_number.slice(-4)} ({formatCurrency(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">To Account Number</label>
                <input
                  id="transfer-to"
                  type="text"
                  name="receiver_account"
                  className={`form-input${sameAccount ? ' input-error' : ''}`}
                  placeholder="Enter recipient account number"
                  value={form.receiver_account}
                  onChange={handleChange}
                  required
                />
                {sameAccount && <span className="form-error">Cannot transfer to the same account</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  id="transfer-amount"
                  type="number"
                  name="amount"
                  className={`form-input amount-input${insufficientFunds ? ' input-error' : ''}`}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                />
                {insufficientFunds && <span className="form-error">Insufficient balance</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  id="transfer-description"
                  type="text"
                  name="description"
                  className="form-input"
                  placeholder="e.g. Rent payment"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <button
                id="transfer-submit"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || !form.sender_account || !form.receiver_account || sameAccount || insufficientFunds}
              >
                {loading ? 'Processing...' : `Transfer${form.amount ? ' ' + formatCurrency(form.amount) : ''}`}
              </button>
            </form>
          </div>

          <div className="txn-info-panel">
            {senderAccount ? (
              <div className="glass-card txn-account-preview">
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-accent)', fontWeight: 700 }}>
                  Sending From
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: 4 }}>{senderAccount.account_number}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginTop: 16 }}>
                  {formatCurrency(senderAccount.balance)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>Available Balance</div>
                {form.amount && parseFloat(form.amount) > 0 && !insufficientFunds && (
                  <div style={{ marginTop: 20, padding: 16, background: 'rgba(239,68,68,0.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Balance After Transfer</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: 4 }}>
                      {formatCurrency(parseFloat(senderAccount.balance) - parseFloat(form.amount))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card txn-account-preview" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⇄</div>
                <p>Select an account to send from</p>
              </div>
            )}

            <div className="glass-card txn-tips">
              <h4>Transfer Info</h4>
              <ul>
                <li>Transfers are instant and irreversible</li>
                <li>Enter the exact 10-digit account number</li>
                <li>You can transfer to any active account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
