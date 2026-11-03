import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../hooks/useFetch'
import { errMsg, fileUrl, fmtDate } from '../utils'

export default function MyApplications() {
  const { data, loading, error, reload } = useFetch('/applications/mine')
  const [busy, setBusy] = useState(null)

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return
    setBusy(id)
    try {
      await api.delete(`/applications/${id}`)
      toast.success('Application withdrawn')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(null)
    }
  }

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
    { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
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
      <h1 className="mb-6 text-4xl font-semibold">My applications</h1>
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
    </div>
  )
}
