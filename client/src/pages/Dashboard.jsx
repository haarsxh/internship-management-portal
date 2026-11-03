import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import useFetch from '../hooks/useFetch'
import InternshipCard from '../components/InternshipCard'
import ProfileMeter from '../components/ProfileMeter'
import { ApplicationsOverTime, HorizontalBars, StatusPie } from '../components/AdminCharts'
import { useAuth } from '../context/AuthContext'
import { daysLeft, fmtDateTime } from '../utils'

function StatCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone}`}>{value ?? 0}</p>
    </div>
  )
}

function Alerts() {
  const { data } = useFetch('/student/alerts')
  if (!data?.alerts?.length) return null
  return (
    <div className="mb-6 space-y-2" aria-label="Alerts">
      {data.alerts.map((a) => {
        const key = a.type === 'deadline' ? a.internshipId : a.applicationId
        const to = a.type === 'deadline' ? `/internships/${a.internshipId}` : '/applications'
        const left = a.type === 'deadline' ? daysLeft(a.deadline) : 0
        return (
          <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span>
              {a.type === 'deadline'
                ? `Closing ${left <= 1 ? 'within a day' : `in ${left} days`}: ${a.title}`
                : `Interview proposed for ${a.title} on ${fmtDateTime(a.proposedAt)}`}
            </span>
            <Link to={to} className="shrink-0 text-indigo-700 hover:underline">
              {a.type === 'deadline' ? 'Apply now' : 'Respond'} &rsaquo;
            </Link>
          </div>
        )
      })}
    </div>
  )
}

function Recommended() {
  const { data, loading } = useFetch('/student/recommendations')
  if (loading || !data) return null
  if (data.needsSkills) {
    return (
      <p className="mt-8 text-sm text-slate-500">
        <Link to="/profile" className="text-indigo-700 hover:underline">Add your skills</Link> to get internship recommendations.
      </p>
    )
  }
  if (data.internships.length === 0) return null
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl">Recommended for you</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {data.internships.slice(0, 4).map((i) => (
          <InternshipCard key={i._id} internship={i} />
        ))}
      </div>
    </section>
  )
}

function StudentDashboard({ user }) {
  const { data, loading, error, reload } = useFetch('/applications/mine')
  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const count = (s) => data.applications.filter((a) => a.status === s).length
  return (
    <>
      <Alerts />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={data.applications.length} />
        <StatCard label="Shortlisted" value={count('shortlisted')} tone="text-amber-600" />
        <StatCard label="Accepted" value={count('accepted')} tone="text-green-600" />
        <StatCard label="Rejected" value={count('rejected')} tone="text-red-600" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ProfileMeter user={user} />
        <div className="rounded-xl bg-white p-5">
          <h3 className="font-semibold">Keep going</h3>
          <p className="mt-1 text-sm text-slate-500">Browse open roles or revisit the ones you bookmarked.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/internships" className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-[#0077ed]">Find internships</Link>
            <Link to="/saved" className="rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Saved</Link>
          </div>
        </div>
      </div>
      <Recommended />
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
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={s.usersByRole.student} />
        <StatCard label="Companies" value={s.usersByRole.company} />
        <StatCard label="Pending approvals" value={s.pendingCompanies} tone="text-amber-600" />
        <StatCard label="Open internships" value={s.internshipsByStatus.open} tone="text-green-600" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ApplicationsOverTime data={s.applicationsOverTime} />
        </div>
        <StatusPie counts={s.applicationsByStatus} />
        <HorizontalBars title="Most applied internships" rows={s.topInternships} labelKey="title" valueKey="applications" valueLabel="Applications" />
        <HorizontalBars title="Top companies by postings" rows={s.topCompanies} labelKey="name" valueKey="internships" valueLabel="Internships" />
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
      {user.role === 'student' && <StudentDashboard user={user} />}
      {user.role === 'company' && <CompanyDashboard user={user} />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  )
}
