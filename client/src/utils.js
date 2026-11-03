export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
// Uploaded files are served from the server origin, not under /api
export const fileUrl = (path) => (path ? API_URL.replace(/\/api\/?$/, '') + path : '#')

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong'

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')
