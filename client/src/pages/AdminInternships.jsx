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

export default function AdminInternships() {
  const [status, setStatus] = useState('')
  const { data, loading, error, reload } = useFetch('/admin/internships', status ? { status } : undefined)
  const [toDelete, setToDelete] = useState(null)

  const toggleStatus = async (i) => {
    try {
      await api.put(`/internships/${i._id}`, { status: i.status === 'open' ? 'closed' : 'open' })
      toast.success(i.status === 'open' ? 'Internship closed' : 'Internship reopened')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/internships/${toDelete._id}`)
      toast.success('Internship removed')
      setToDelete(null)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const columns = [
    { header: 'Internship', render: (i) => <Link to={`/internships/${i._id}`} className="font-medium text-indigo-600 hover:underline">{i.title}</Link> },
    { header: 'Company', render: (i) => i.company?.companyName || i.company?.name || '-' },
    { header: 'Deadline', render: (i) => fmtDate(i.deadline) },
    { header: 'Applicants', render: (i) => i.applicationCount },
    { header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      header: 'Actions',
      render: (i) => (
        <div className="flex gap-3 text-sm">
          <button onClick={() => toggleStatus(i)} className="text-slate-600 hover:underline">{i.status === 'open' ? 'Close' : 'Reopen'}</button>
          <button onClick={() => setToDelete(i)} className="text-red-600 hover:underline">Remove</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl">Moderate internships</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data.internships.length === 0 ? <EmptyState title="No internships" /> : <DataTable columns={columns} rows={data.internships} />}

      <Modal open={!!toDelete} title="Remove internship?" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">"{toDelete?.title}" and all its applications will be permanently removed. This is recorded in the audit log.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setToDelete(null)} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Cancel</button>
          <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Remove</button>
        </div>
      </Modal>
    </div>
  )
}
