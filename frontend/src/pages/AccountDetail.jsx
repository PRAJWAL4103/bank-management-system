import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { accountsApi, transactionsApi } from '../api/client'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const STATUS_BADGE = { Active: 'badge-success', Blocked: 'badge-danger', Closed: 'badge-warning' }
const TXN_BADGE = { Deposit: 'badge-success', Withdrawal: 'badge-danger', Transfer: 'badge-info' }

export default function AccountDetail() {
  const { accountNumber } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [accRes, txnRes] = await Promise.all([
          accountsApi.detail(accountNumber),
          transactionsApi.history(accountNumber, { page_size: 10 })
        ])
        setAccount(accRes.data.data)
        setTransactions(txnRes.data.data?.transactions || [])
      } catch {
        navigate('/accounts')
      }
      setLoading(false)
    }
    load()
  }, [accountNumber])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading account details...</p>
      </div>
    )
  }

  if (!account) return null

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link to="/accounts" style={{ color: 'var(--accent-primary)' }}>Accounts</Link>
          {' / '} {account.account_number}
        </div>

        {/* Account Hero Card */}
        <div className="glass-card" style={{
          padding: 40,
          marginBottom: 24,
          background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(6,182,212,0.05) 100%)',
          borderColor: 'rgba(59,130,246,0.25)'
        }}>
          <div className="flex justify-between items-center flex-wrap gap-md" style={{ marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-accent)', marginBottom: 6 }}>
                {account.account_type} Account
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                {account.account_number}
              </div>
            </div>
            <span className={`badge ${STATUS_BADGE[account.status]}`} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              {account.status}
            </span>
          </div>

          <div style={{ fontSize: '2.8rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {formatCurrency(account.balance)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Available Balance</div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link to={`/deposit?account=${account.account_number}`} className="btn btn-primary btn-sm">Deposit</Link>
            <Link to={`/withdraw?account=${account.account_number}`} className="btn btn-secondary btn-sm">Withdraw</Link>
            <Link to={`/transfer?from=${account.account_number}`} className="btn btn-secondary btn-sm">Transfer</Link>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 8 }}>Account Type</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{account.account_type}</div>
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 8 }}>Opened On</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {new Date(account.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Transaction History</h3>
            <Link to="/transactions" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No transactions for this account yet.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(txn => (
                    <tr key={txn.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{txn.transaction_id}</td>
                      <td><span className={`badge ${TXN_BADGE[txn.transaction_type]}`}>{txn.transaction_type}</span></td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(txn.amount)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{txn.description || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(txn.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
