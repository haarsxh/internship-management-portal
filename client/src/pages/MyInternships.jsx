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
import useFetch from '../hooks/useFetch'
import { errMsg, fmtDate } from '../utils'

export default function MyInternships() {
  const { data, loading, error, reload } = useFetch('/internships/mine')
  const [toDelete, setToDelete] = useState(null)

  const confirmDelete = async () => {
    try {
      await api.delete(`/internships/${toDelete._id}`)
      toast.success('Internship deleted')
      setToDelete(null)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const toggleStatus = async (i) => {
    try {
      await api.put(`/internships/${i._id}`, { status: i.status === 'open' ? 'closed' : 'open' })
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const columns = [
    { header: 'Title', render: (i) => <span className="font-medium">{i.title}</span> },
    { header: 'Deadline', render: (i) => fmtDate(i.deadline) },
    { header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    { header: 'Applicants', render: (i) => <Link to={`/my-internships/${i._id}/applicants`} className="text-indigo-600 hover:underline">{i.applicationCount} view</Link> },
    {
      header: 'Actions',
      render: (i) => (
        <div className="flex gap-3 text-sm">
          <Link to={`/my-internships/${i._id}/edit`} className="text-indigo-600 hover:underline">Edit</Link>
          <button onClick={() => toggleStatus(i)} className="text-slate-600 hover:underline">{i.status === 'open' ? 'Close' : 'Reopen'}</button>
          <button onClick={() => setToDelete(i)} className="text-red-600 hover:underline">Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-semibold">My internships</h1>
        <Link to="/my-internships/new" className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          + Post internship
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.internships.length === 0 ? (
        <EmptyState title="Nothing posted yet" message="Create your first internship listing." />
      ) : (
        <DataTable columns={columns} rows={data.internships} />
      )}

      <Modal open={!!toDelete} title="Delete internship?" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          "{toDelete?.title}" and all its applications will be permanently removed.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setToDelete(null)} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Cancel</button>
          <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
