export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
// Uploaded files are served from the server origin, not under /api
export const fileUrl = (path) => (path ? API_URL.replace(/\/api\/?$/, '') + path : '#')

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong'

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '-'

// Whole days from now until a date (rounded up)
export const daysLeft = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000)

// <input type="datetime-local"> value for "now + n days at 10:00"
export const defaultInterviewSlot = (n = 3) => {
  const d = new Date(Date.now() + n * 86400000)
  d.setHours(10, 0, 0, 0)
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Builds a CSV string; cells starting with = + - @ are prefixed so spreadsheets don't run them as formulas
export const toCsv = (rows) =>
  rows
    .map((row) =>
      row
        .map((cell) => {
          let v = cell == null ? '' : String(cell)
          if (/^[=+\-@]/.test(v)) v = `'${v}`
          return `"${v.replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\n')

export const downloadFile = (filename, text, type = 'text/csv') => {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
