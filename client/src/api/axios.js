import axios from 'axios'
import { API_URL } from '../utils'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Expired/invalid token on a protected call: clear session and send user to login.
// The initial /auth/me session check is excluded: AuthContext clears the token itself, so
// public pages stay usable and ProtectedRoute does the redirect where needed.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = ['/auth/login', '/auth/register', '/auth/me'].some((u) => err.config?.url === u)
    if (err.response?.status === 401 && !isAuthCall && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
