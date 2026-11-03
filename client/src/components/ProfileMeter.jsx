import { Link } from 'react-router-dom'

// Completeness of a student profile: five fields worth 20% each
export function profileChecks(user) {
  const p = user.profile || {}
  return [
    ['Upload a resume', !!p.resumeUrl],
    ['Add your skills', (p.skills || []).length > 0],
    ['Add your college', !!p.college],
    ['Add your branch', !!p.branch],
    ['Add a phone number', !!p.phone],
  ]
}

export default function ProfileMeter({ user }) {
  const checks = profileChecks(user)
  const done = checks.filter(([, ok]) => ok).length
  const pct = Math.round((done / checks.length) * 100)
  const missing = checks.filter(([, ok]) => !ok)

  return (
    <div className="rounded-xl bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">Profile completeness</h3>
        <span className="text-2xl font-semibold tracking-tight">{pct}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {missing.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-500">
          {missing.map(([label]) => (
            <li key={label}>
              <Link to="/profile" className="text-indigo-700 hover:underline">
                {label} &rsaquo;
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-green-700">Your profile is complete.</p>
      )}
    </div>
  )
}
