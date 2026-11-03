import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import useFetch from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone}`}>{value ?? 0}</p>
    </div>
  )
}

function BarList({ title, rows, labelKey, valueKey }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]))
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {rows.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
      {rows.map((r) => (
        <div key={r[labelKey]} className="mb-2 text-sm">
          <div className="flex justify-between">
            <span className="truncate">{r[labelKey]}</span>
            <span className="font-medium">{r[valueKey]}</span>
          </div>
          <div className="mt-1 h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-indigo-500" style={{ width: `${(r[valueKey] / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function StudentDashboard() {
  const { data, loading, error, reload } = useFetch('/applications/mine')
  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const count = (s) => data.applications.filter((a) => a.status === s).length
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={data.applications.length} />
        <StatCard label="Shortlisted" value={count('shortlisted')} tone="text-amber-600" />
        <StatCard label="Accepted" value={count('accepted')} tone="text-green-600" />
        <StatCard label="Rejected" value={count('rejected')} tone="text-red-600" />
      </div>
      <Link to="/internships" className="mt-6 inline-block rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
        Find internships
      </Link>
    </>
  )
}

function CompanyDashboard({ user }) {
  const { data, loading, error, reload } = useFetch('/internships/mine')
  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const list = data.internships
  return (
    <>
      {!user.isApproved && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Your company account is awaiting admin approval. You can post internships once approved.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Internships posted" value={list.length} />
        <StatCard label="Open" value={list.filter((i) => i.status === 'open').length} tone="text-green-600" />
        <StatCard label="Total applicants" value={list.reduce((n, i) => n + i.applicationCount, 0)} tone="text-indigo-600" />
      </div>
    </>
  )
}

function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/admin/stats')
  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const s = data.stats
  const rows = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count }))
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={s.usersByRole.student} />
        <StatCard label="Companies" value={s.usersByRole.company} />
        <StatCard label="Pending approvals" value={s.pendingCompanies} tone="text-amber-600" />
        <StatCard label="Open internships" value={s.internshipsByStatus.open} tone="text-green-600" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarList title="Applications by status" rows={rows(s.applicationsByStatus)} labelKey="name" valueKey="count" />
        <BarList title="Most applied internships" rows={s.topInternships} labelKey="title" valueKey="applications" />
        <BarList title="Top companies by postings" rows={s.topCompanies} labelKey="name" valueKey="internships" />
      </div>
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="mb-1 text-4xl font-semibold">Hello, {user.name}</h1>
      <p className="mb-6 text-sm capitalize text-slate-500">{user.role} dashboard</p>
      {user.role === 'student' && <StudentDashboard />}
      {user.role === 'company' && <CompanyDashboard user={user} />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  )
}
