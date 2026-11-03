import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'
import { errMsg, fileUrl, fmtDate } from '../utils'

const statuses = ['applied', 'shortlisted', 'accepted', 'rejected']

export default function Applicants() {
  const { id } = useParams()
  const { data, loading, error, reload } = useFetch(`/internships/${id}/applications`)

  const changeStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status })
      toast.success(`Marked ${status}`)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const columns = [
    { header: 'Student', render: (a) => <div><p className="font-medium">{a.student?.name}</p><p className="text-xs text-slate-500">{a.student?.email}</p></div> },
    { header: 'College', render: (a) => [a.student?.profile?.college, a.student?.profile?.branch].filter(Boolean).join(' · ') || '-' },
    { header: 'Applied', render: (a) => fmtDate(a.createdAt) },
    { header: 'Cover letter', render: (a) => <span className="line-clamp-2 max-w-xs text-slate-600" title={a.coverLetter}>{a.coverLetter || '-'}</span> },
    { header: 'Resume', render: (a) => <a href={fileUrl(a.resumeUrl)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View</a> },
    {
      header: 'Status',
      render: (a) => (
        <select value={a.status} onChange={(e) => changeStatus(a._id, e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-sm capitalize">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ]

  return (
    <div>
      <Link to="/my-internships" className="text-sm text-indigo-600 hover:underline">&larr; My internships</Link>
      <h1 className="mb-6 mt-2 text-4xl font-semibold">Applicants{data ? `: ${data.internship.title}` : ''}</h1>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.applications.length === 0 ? (
        <EmptyState title="No applicants yet" />
      ) : (
        <DataTable columns={columns} rows={data.applications} />
      )}
    </div>
  )
}
