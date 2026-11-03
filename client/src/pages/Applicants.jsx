import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import FormInput from '../components/FormInput'
import useFetch from '../hooks/useFetch'
import { defaultInterviewSlot, downloadFile, errMsg, fileUrl, fmtDate, fmtDateTime, toCsv } from '../utils'

const statuses = ['applied', 'shortlisted', 'accepted', 'rejected']
const interviewStyles = {
  proposed: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-slate-200 text-slate-600',
}

function Stars({ value }) {
  if (!value) return <span className="text-slate-400">-</span>
  return (
    <span className="text-amber-500" title={`${value} / 5`}>
      {'★'.repeat(value)}
      <span className="text-slate-300">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

export default function Applicants() {
  const { id } = useParams()
  const { data, loading, error, reload } = useFetch(`/internships/${id}/applications`)

  const [filters, setFilters] = useState({ q: '', status: '', skill: '', sort: 'newest' })
  const [selected, setSelected] = useState(new Set())
  const [review, setReview] = useState(null) // { app, notes, rating }
  const [interview, setInterview] = useState(null) // { app, proposedAt, note }
  const [saving, setSaving] = useState(false)

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const visible = useMemo(() => {
    if (!data) return []
    const q = filters.q.trim().toLowerCase()
    const skill = filters.skill.trim().toLowerCase()
    return data.applications
      .filter((a) => !filters.status || a.status === filters.status)
      .filter((a) => !q || `${a.student?.name} ${a.student?.email}`.toLowerCase().includes(q))
      .filter((a) => !skill || (a.student?.profile?.skills || []).some((s) => s.toLowerCase().includes(skill)))
      .sort((a, b) => {
        if (filters.sort === 'rating') return (b.rating || 0) - (a.rating || 0)
        const diff = new Date(b.createdAt) - new Date(a.createdAt)
        return filters.sort === 'oldest' ? -diff : diff
      })
  }, [data, filters])

  const act = async (fn, okMsg) => {
    setSaving(true)
    try {
      await fn()
      toast.success(okMsg)
      await reload()
      return true
    } catch (err) {
      toast.error(errMsg(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = (appId, status) => act(() => api.put(`/applications/${appId}/status`, { status }), `Marked ${status}`)

  const bulk = async (status) => {
    const ids = [...selected]
    if (await act(() => api.put('/applications/bulk/status', { ids, status }), `${ids.length} application(s) marked ${status}`)) {
      setSelected(new Set())
    }
  }

  const toggle = (appId) => {
    const next = new Set(selected)
    next.has(appId) ? next.delete(appId) : next.add(appId)
    setSelected(next)
  }
  const allSelected = visible.length > 0 && visible.every((a) => selected.has(a._id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((a) => a._id)))

  const saveReview = async (e) => {
    e.preventDefault()
    const ok = await act(
      () => api.put(`/applications/${review.app._id}/review`, { notes: review.notes, rating: review.rating || null }),
      'Review saved',
    )
    if (ok) setReview(null)
  }

  const saveInterview = async (e) => {
    e.preventDefault()
    if (!interview.proposedAt || new Date(interview.proposedAt) <= new Date()) return toast.error('Pick a date in the future')
    const ok = await act(
      () => api.put(`/applications/${interview.app._id}/interview`, { proposedAt: new Date(interview.proposedAt).toISOString(), note: interview.note }),
      'Interview proposed',
    )
    if (ok) setInterview(null)
  }

  const cancelInterview = (appId) => act(() => api.delete(`/applications/${appId}/interview`), 'Interview cancelled')

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'College', 'Branch', 'Skills', 'Applied on', 'Status', 'Rating', 'Interview', 'Interview status', 'Notes', 'Cover letter'],
      ...visible.map((a) => [
        a.student?.name,
        a.student?.email,
        a.student?.profile?.college,
        a.student?.profile?.branch,
        (a.student?.profile?.skills || []).join('; '),
        fmtDate(a.createdAt),
        a.status,
        a.rating,
        a.interview?.proposedAt ? fmtDateTime(a.interview.proposedAt) : '',
        a.interview?.status,
        a.notes,
        a.coverLetter,
      ]),
    ]
    downloadFile(`applicants-${data.internship.title.replace(/\W+/g, '-').toLowerCase()}.csv`, toCsv(rows))
  }

  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} />,
      render: (a) => <input type="checkbox" aria-label={`Select ${a.student?.name}`} checked={selected.has(a._id)} onChange={() => toggle(a._id)} />,
    },
    { header: 'Student', render: (a) => <div><p className="font-medium">{a.student?.name}</p><p className="text-xs text-slate-500">{a.student?.email}</p></div> },
    {
      header: 'Profile',
      render: (a) => (
        <div className="max-w-[200px] text-xs text-slate-600">
          <p>{[a.student?.profile?.college, a.student?.profile?.branch].filter(Boolean).join(' · ') || '-'}</p>
          <p className="text-slate-400">{(a.student?.profile?.skills || []).join(', ')}</p>
        </div>
      ),
    },
    { header: 'Applied', render: (a) => fmtDate(a.createdAt) },
    { header: 'Resume', render: (a) => <a href={fileUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View</a> },
    {
      header: 'Status',
      render: (a) => (
        <select
          value={a.status}
          disabled={saving}
          onChange={(e) => changeStatus(a._id, e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm capitalize"
        >
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      header: 'Review',
      render: (a) => (
        <div>
          <Stars value={a.rating} />
          {a.notes && <p className="max-w-[160px] truncate text-xs text-slate-500" title={a.notes}>{a.notes}</p>}
          <button onClick={() => setReview({ app: a, notes: a.notes || '', rating: a.rating || 0 })} className="text-xs text-indigo-700 hover:underline">
            {a.notes || a.rating ? 'Edit' : 'Add notes'}
          </button>
        </div>
      ),
    },
    {
      header: 'Interview',
      render: (a) =>
        a.interview?.status ? (
          <div className="text-sm">
            <p>{fmtDateTime(a.interview.proposedAt)}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${interviewStyles[a.interview.status]}`}>{a.interview.status}</span>
            <button onClick={() => cancelInterview(a._id)} className="ml-2 text-xs text-red-600 hover:underline">Cancel</button>
          </div>
        ) : a.status === 'rejected' ? (
          <span className="text-slate-400">-</span>
        ) : (
          <button onClick={() => setInterview({ app: a, proposedAt: defaultInterviewSlot(), note: '' })} className="text-sm text-indigo-700 hover:underline">
            Schedule
          </button>
        ),
    },
  ]

  const inputCls = 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm'

  return (
    <div>
      <Link to="/my-internships" className="text-sm text-indigo-600 hover:underline">&larr; My internships</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Applicants{data ? `: ${data.internship.title}` : ''}</h1>
        {data && data.applications.length > 0 && (
          <button onClick={exportCsv} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
            Export CSV ({visible.length})
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.applications.length === 0 ? (
        <EmptyState title="No applicants yet" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <input name="q" value={filters.q} onChange={setFilter} placeholder="Search name or email" className={`${inputCls} min-w-48 flex-1`} />
            <input name="skill" value={filters.skill} onChange={setFilter} placeholder="Skill" className={`${inputCls} w-36`} />
            <select name="status" value={filters.status} onChange={setFilter} className={inputCls}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <select name="sort" value={filters.sort} onChange={setFilter} className={inputCls}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>

          {selected.size > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm">
              <span className="font-medium">{selected.size} selected</span>
              <button disabled={saving} onClick={() => bulk('shortlisted')} className="rounded-full bg-indigo-600 px-4 py-1.5 text-white hover:bg-[#0077ed] disabled:opacity-60">Shortlist</button>
              <button disabled={saving} onClick={() => bulk('accepted')} className="rounded-full border border-slate-300 px-4 py-1.5 hover:bg-slate-50 disabled:opacity-60">Accept</button>
              <button disabled={saving} onClick={() => bulk('rejected')} className="rounded-full border border-red-300 px-4 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60">Reject</button>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 hover:underline">Clear</button>
            </div>
          )}

          {visible.length === 0 ? <EmptyState title="No applicants match these filters" /> : <DataTable columns={columns} rows={visible} />}
        </>
      )}

      <Modal open={!!review} title={`Review: ${review?.app.student?.name}`} onClose={() => setReview(null)}>
        {review && (
          <form onSubmit={saveReview}>
            <p className="mb-3 text-xs text-slate-500">Private to your company. Students never see notes or ratings.</p>
            <div className="mb-4 flex items-center gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={review.rating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setReview({ ...review, rating: review.rating === n ? 0 : n })}
                  className={`text-3xl ${n <= review.rating ? 'text-amber-500' : 'text-slate-300'} hover:text-amber-400`}
                >
                  ★
                </button>
              ))}
            </div>
            <FormInput label="Notes" name="notes" as="textarea" rows={5} maxLength={2000} value={review.notes} onChange={(e) => setReview({ ...review, notes: e.target.value })} />
            <button disabled={saving} className="w-full rounded-full bg-indigo-600 py-2.5 text-white hover:bg-[#0077ed] disabled:opacity-60">
              {saving ? 'Saving...' : 'Save review'}
            </button>
          </form>
        )}
      </Modal>

      <Modal open={!!interview} title={`Interview: ${interview?.app.student?.name}`} onClose={() => setInterview(null)}>
        {interview && (
          <form onSubmit={saveInterview}>
            <FormInput label="Date and time" name="proposedAt" type="datetime-local" value={interview.proposedAt} onChange={(e) => setInterview({ ...interview, proposedAt: e.target.value })} />
            <FormInput label="Note (optional)" name="note" placeholder="Video call link, location..." maxLength={500} value={interview.note} onChange={(e) => setInterview({ ...interview, note: e.target.value })} />
            <button disabled={saving} className="w-full rounded-full bg-indigo-600 py-2.5 text-white hover:bg-[#0077ed] disabled:opacity-60">
              {saving ? 'Sending...' : 'Propose interview'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
