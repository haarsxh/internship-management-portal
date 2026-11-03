import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'
import { errMsg, fmtDateTime } from '../utils'

export default function AdminAnnouncements() {
  const { data, loading, error, reload } = useFetch('/admin/announcements')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const publish = async (e) => {
    e.preventDefault()
    if (!message.trim()) return setErr('Write a message first')
    if (message.length > 280) return setErr('Keep it under 280 characters')
    setErr('')
    setSaving(true)
    try {
      await api.post('/admin/announcements', { message })
      toast.success('Announcement published')
      setMessage('')
      reload()
    } catch (e2) {
      toast.error(errMsg(e2))
    } finally {
      setSaving(false)
    }
  }

  const act = async (fn, okMsg) => {
    try {
      await fn()
      toast.success(okMsg)
      reload()
    } catch (e2) {
      toast.error(errMsg(e2))
    }
  }

  const columns = [
    { header: 'Message', render: (a) => <span className="whitespace-normal">{a.message}</span> },
    { header: 'Posted', render: (a) => <span className="whitespace-nowrap">{fmtDateTime(a.createdAt)}</span> },
    {
      header: 'Live',
      render: (a) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs ${a.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{a.active ? 'Showing' : 'Hidden'}</span>
      ),
    },
    {
      header: 'Actions',
      render: (a) => (
        <div className="flex gap-3 text-sm">
          <button onClick={() => act(() => api.put(`/admin/announcements/${a._id}`, { active: !a.active }), a.active ? 'Hidden' : 'Now showing')} className="text-indigo-700 hover:underline">
            {a.active ? 'Hide' : 'Show'}
          </button>
          <button onClick={() => window.confirm('Delete this announcement?') && act(() => api.delete(`/admin/announcements/${a._id}`), 'Deleted')} className="text-red-600 hover:underline">
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-4xl">Announcements</h1>
      <form onSubmit={publish} noValidate className="mb-8 max-w-2xl rounded-2xl bg-white p-6">
        <FormInput label="New banner message" name="message" as="textarea" rows={3} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} error={err} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{message.length}/280 · Publishing replaces the banner currently shown to everyone.</span>
          <button disabled={saving} className="rounded-full bg-indigo-600 px-5 py-2 text-white hover:bg-[#0077ed] disabled:opacity-60">{saving ? 'Publishing...' : 'Publish'}</button>
        </div>
      </form>
      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data.announcements.length === 0 ? <EmptyState title="No announcements yet" /> : <DataTable columns={columns} rows={data.announcements} />}
    </div>
  )
}
