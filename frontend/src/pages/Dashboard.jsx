import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { accountsApi, transactionsApi } from '../api/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function TxnTypeLabel({ type }) {
  const map = { Deposit: 'badge-success', Withdrawal: 'badge-danger', Transfer: 'badge-info' }
  return <span className={`badge ${map[type] || 'badge-primary'}`}>{type}</span>
}

function AccountCard({ account }) {
  const statusMap = { Active: 'badge-success', Blocked: 'badge-danger', Closed: 'badge-warning' }
  return (
    <div className="account-card glass-card">
      <div className="account-card-top">
        <div className="account-type-chip">{account.account_type}</div>
        <span className={`badge ${statusMap[account.status]}`}>{account.status}</span>
      </div>
      <div className="account-number">•••• {account.account_number?.slice(-4)}</div>
      <div className="account-balance">{formatCurrency(account.balance)}</div>
      <Link to={`/accounts/${account.account_number}`} className="btn btn-secondary btn-sm">
        View Details →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [accRes, txnRes] = await Promise.all([
          accountsApi.list(),
          transactionsApi.all({ page_size: 5 })
        ])
        setAccounts(accRes.data.data || [])
        setTransactions(txnRes.data.data?.transactions || [])
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [])

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
  const activeAccounts = accounts.filter(a => a.status === 'Active').length

  // Build mini chart data from recent transactions
  const chartData = (() => {
    if (!transactions.length) return []
    const map = {}
    transactions.forEach(t => {
      const d = new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      map[d] = (map[d] || 0) + parseFloat(t.amount || 0)
    })
    return Object.entries(map).map(([date, amount]) => ({ date, amount })).slice(0, 7)
  })()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="page-wrapper dashboard animate-fade-in">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's a summary of your financial activity</p>
        </div>
        <Link to="/accounts" className="btn btn-primary">+ Open Account</Link>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats grid-3">
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">{formatCurrency(totalBalance)}</div>
          <div className="stat-change text-success">Across all accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Accounts</div>
          <div className="stat-value" style={{ fontSize: '2.5rem' }}>{activeAccounts}</div>
          <div className="stat-change text-muted">{accounts.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recent Transactions</div>
          <div className="stat-value" style={{ fontSize: '2.5rem' }}>{transactions.length}</div>
          <div className="stat-change text-muted">Last few transactions</div>
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="dashboard-mid">
        {/* Chart */}
        <div className="glass-card chart-card">
          <h3 className="card-title">Transaction Activity</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#8b9ab8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b9ab8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#8b9ab8' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(v) => [formatCurrency(v), 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No transaction data yet</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card quick-actions-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link to="/deposit" className="quick-action">
              <div className="qa-icon qa-green">↓</div>
              <span>Deposit</span>
            </Link>
            <Link to="/withdraw" className="quick-action">
              <div className="qa-icon qa-red">↑</div>
              <span>Withdraw</span>
            </Link>
            <Link to="/transfer" className="quick-action">
              <div className="qa-icon qa-blue">⇄</div>
              <span>Transfer</span>
            </Link>
            <Link to="/transactions" className="quick-action">
              <div className="qa-icon qa-purple">≡</div>
              <span>History</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">My Accounts</h3>
            <Link to="/accounts" className="section-link">View all →</Link>
          </div>
          <div className="accounts-row">
            {accounts.slice(0, 3).map(acc => <AccountCard key={acc.id} account={acc} />)}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <Link to="/transactions" className="section-link">View all →</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="glass-card empty-state">
            <div className="empty-icon">💳</div>
            <h4>No transactions yet</h4>
            <p>Make your first deposit or transfer to get started.</p>
            <Link to="/deposit" className="btn btn-primary btn-sm">Make a Deposit</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {txn.transaction_id}
                    </td>
                    <td><TxnTypeLabel type={txn.transaction_type} /></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txn.sender_account}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txn.receiver_account}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(txn.amount)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(txn.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
