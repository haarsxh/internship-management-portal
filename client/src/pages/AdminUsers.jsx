import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'
import { errMsg, fmtDate } from '../utils'

export default function AdminUsers() {
  const [role, setRole] = useState('')
  const { data, loading, error, reload } = useFetch('/admin/users', role ? { role } : undefined)
  const [toDelete, setToDelete] = useState(null)

  const setApproval = async (u, isApproved) => {
    try {
      await api.put(`/admin/users/${u._id}/approve`, { isApproved })
      toast.success(isApproved ? 'Approved' : 'Approval revoked')
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/users/${toDelete._id}`)
      toast.success('User deleted')
      setToDelete(null)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    }
  }

  const columns = [
    { header: 'Name', render: (u) => <div><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div> },
    { header: 'Role', render: (u) => <span className="capitalize">{u.role}</span> },
    { header: 'Company', render: (u) => u.companyName || '-' },
    { header: 'Joined', render: (u) => fmtDate(u.createdAt) },
    {
      header: 'Approval',
      render: (u) =>
        u.role !== 'company' ? '-' : u.isApproved ? (
          <button onClick={() => setApproval(u, false)} className="text-sm text-amber-600 hover:underline">Revoke</button>
        ) : (
          <button onClick={() => setApproval(u, true)} className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">Approve</button>
        ),
    },
    { header: '', render: (u) => u.role !== 'admin' && <button onClick={() => setToDelete(u)} className="text-sm text-red-600 hover:underline">Delete</button> },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-semibold">Manage users</h1>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="company">Companies</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data.users.length === 0 ? <EmptyState title="No users" /> : <DataTable columns={columns} rows={data.users} />}

      <Modal open={!!toDelete} title="Delete user?" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          {toDelete?.name} and all their related data will be permanently removed.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setToDelete(null)} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Cancel</button>
          <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
