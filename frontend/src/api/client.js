import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.put('/auth/change-password/', data),
}

// ── Accounts ──────────────────────────────────────────
export const accountsApi = {
  create: (data) => api.post('/accounts/', data),
  list: () => api.get('/accounts/list/'),
  detail: (accountNumber) => api.get(`/accounts/${accountNumber}/`),
  status: (accountNumber) => api.get(`/accounts/${accountNumber}/status/`),
}

// ── Transactions ───────────────────────────────────────
export const transactionsApi = {
  deposit: (data) => api.post('/transactions/deposit/', data),
  withdraw: (data) => api.post('/transactions/withdraw/', data),
  transfer: (data) => api.post('/transactions/transfer/', data),
  history: (accountNumber, params) => api.get(`/transactions/${accountNumber}/`, { params }),
  all: (params) => api.get('/transactions/', { params }),
}

export default api
