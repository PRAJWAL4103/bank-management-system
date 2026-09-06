import { useState, useEffect, useCallback } from 'react'
import { transactionsApi } from '../api/client'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const TYPE_BADGE = { Deposit: 'badge-success', Withdrawal: 'badge-danger', Transfer: 'badge-info' }
const STATUS_BADGE = { Completed: 'badge-success', Pending: 'badge-warning', Failed: 'badge-danger' }

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', status: '' })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, page_size: 15 }
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status
      const res = await transactionsApi.all(params)
      const data = res.data.data
      setTransactions(data.transactions || [])
      setPagination({ page: data.page, totalPages: data.total_pages || 1, total: data.total || 0 })
    } catch {}
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchTransactions(1) }, [fetchTransactions])

  const handleFilterChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="page-header">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Complete history of all your transactions</p>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Filter
          </span>
          <select
            id="txn-type-filter"
            name="type"
            className="form-select"
            style={{ width: 160 }}
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
          </select>
          <select
            id="txn-status-filter"
            name="status"
            className="form-select"
            style={{ width: 160 }}
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {pagination.total} transaction{pagination.total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading transactions...</p></div>
        ) : transactions.length === 0 ? (
          <div className="glass-card" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💳</div>
            <h3>No transactions found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              {filters.type || filters.status ? 'Try clearing the filters.' : 'Your transaction history will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="animate-slide-in">
                      <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {txn.transaction_id}
                      </td>
                      <td><span className={`badge ${TYPE_BADGE[txn.transaction_type]}`}>{txn.transaction_type}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txn.sender_account}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txn.receiver_account}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(txn.amount)}</td>
                      <td><span className={`badge ${STATUS_BADGE[txn.status]}`}>{txn.status}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.description || '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {formatDate(txn.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
