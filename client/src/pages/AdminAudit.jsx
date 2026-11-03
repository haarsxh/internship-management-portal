import { useState } from 'react'
import DataTable from '../components/DataTable'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'
import { fmtDateTime } from '../utils'

const groups = [
  ['', 'All activity'],
  ['user', 'Users'],
  ['internship', 'Internships'],
  ['announcement', 'Announcements'],
]

export default function AdminAudit() {
  const [group, setGroup] = useState('')
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useFetch('/admin/audit', { page, limit: 15, ...(group && { action: group }) })

  const columns = [
    { header: 'When', render: (e) => <span className="whitespace-nowrap">{fmtDateTime(e.createdAt)}</span> },
    { header: 'Who', render: (e) => e.actorName || '-' },
    { header: 'Action', render: (e) => <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium">{e.action}</span> },
    { header: 'Details', render: (e) => <span className="whitespace-normal text-slate-600">{e.summary}</span> },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl">Audit log</h1>
        <select value={group} onChange={(e) => { setGroup(e.target.value); setPage(1) }} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
          {groups.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.entries.length === 0 ? (
        <EmptyState title="Nothing recorded yet" message="Approvals, deletions, closures and announcements show up here." />
      ) : (
        <>
          <DataTable columns={columns} rows={data.entries} />
          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-slate-300 px-4 py-1 disabled:opacity-40">Prev</button>
              <span>Page {data.page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-full border border-slate-300 px-4 py-1 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
