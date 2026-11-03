import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import StatusTimeline from '../components/StatusTimeline'
import useFetch from '../hooks/useFetch'
import { errMsg, fileUrl, fmtDate, fmtDateTime } from '../utils'

const interviewStyles = {
  proposed: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-slate-200 text-slate-600',
}

export default function MyApplications() {
  const { data, loading, error, reload } = useFetch('/applications/mine')
  const [busy, setBusy] = useState(null)
  const [timelineFor, setTimelineFor] = useState(null)

  const run = async (id, fn, okMsg) => {
    setBusy(id)
    try {
      await fn()
      toast.success(okMsg)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(null)
    }
  }

  const withdraw = (id) => {
    if (!window.confirm('Withdraw this application?')) return
    run(id, () => api.delete(`/applications/${id}`), 'Application withdrawn')
  }
  const respond = (id, response) =>
    run(id, () => api.put(`/applications/${id}/interview/respond`, { response }), response === 'confirmed' ? 'Interview confirmed' : 'Interview declined')

  const columns = [
    {
      header: 'Internship',
      render: (a) =>
        a.internship ? (
          <Link to={`/internships/${a.internship._id}`} className="font-medium text-indigo-600 hover:underline">
            {a.internship.title}
          </Link>
        ) : (
          'Removed'
        ),
    },
    { header: 'Company', render: (a) => a.internship?.company?.companyName || a.internship?.company?.name || '-' },
    { header: 'Applied', render: (a) => fmtDate(a.createdAt) },
    { header: 'Resume', render: (a) => <a href={fileUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View</a> },
    {
      header: 'Status',
      render: (a) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={a.status} />
          <button onClick={() => setTimelineFor(a)} className="text-xs text-indigo-700 hover:underline">
            Timeline
          </button>
        </div>
      ),
    },
    {
      header: 'Interview',
      render: (a) => {
        const iv = a.interview
        if (!iv?.status) return <span className="text-slate-400">-</span>
        return (
          <div className="text-sm">
            <p>{fmtDateTime(iv.proposedAt)}</p>
            {iv.note && <p className="text-xs text-slate-500">{iv.note}</p>}
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs capitalize ${interviewStyles[iv.status]}`}>{iv.status}</span>
            {iv.status === 'proposed' && (
              <div className="mt-2 flex gap-2">
                <button disabled={busy === a._id} onClick={() => respond(a._id, 'confirmed')} className="rounded-full bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-[#0077ed] disabled:opacity-50">
                  Confirm
                </button>
                <button disabled={busy === a._id} onClick={() => respond(a._id, 'declined')} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50">
                  Decline
                </button>
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: '',
      render: (a) =>
        a.status === 'applied' && (
          <button disabled={busy === a._id} onClick={() => withdraw(a._id)} className="text-sm text-red-600 hover:underline disabled:opacity-50">
            Withdraw
          </button>
        ),
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-4xl">My applications</h1>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Browse internships and apply to get started.">
          <Link to="/internships" className="text-indigo-600 hover:underline">Browse internships</Link>
        </EmptyState>
      ) : (
        <DataTable columns={columns} rows={data.applications} />
      )}

      <Modal open={!!timelineFor} title={timelineFor?.internship?.title || 'Application timeline'} onClose={() => setTimelineFor(null)}>
        {timelineFor && <StatusTimeline history={timelineFor.statusHistory} status={timelineFor.status} />}
      </Modal>
    </div>
  )
}
