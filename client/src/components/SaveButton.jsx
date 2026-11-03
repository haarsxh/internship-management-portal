import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../utils'

// Bookmark toggle, shown to students only
export default function SaveButton({ internshipId, saved = false, onChange, className = '' }) {
  const { user } = useAuth()
  const [override, setOverride] = useState(null)
  const [busy, setBusy] = useState(false)
  if (user?.role !== 'student') return null
  const isSaved = override ?? saved

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setBusy(true)
    try {
      if (isSaved) await api.delete(`/student/saved/${internshipId}`)
      else await api.post(`/student/saved/${internshipId}`)
      setOverride(!isSaved)
      toast.success(isSaved ? 'Removed from saved' : 'Saved')
      onChange?.(!isSaved)
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved' : 'Save internship'}
      className={`rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 ${isSaved ? 'text-indigo-600' : ''} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
