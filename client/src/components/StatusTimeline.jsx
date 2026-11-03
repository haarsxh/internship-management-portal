import { fmtDate } from '../utils'

// Applied -> Shortlisted -> Accepted (or Rejected) with the date of each step
export default function StatusTimeline({ history = [], status }) {
  const at = (s) => [...history].reverse().find((h) => h.status === s)?.at
  const last = status === 'rejected' ? 'rejected' : 'accepted'
  const steps = ['applied', 'shortlisted', last].map((s) => ({ key: s, date: at(s) }))
  // A direct accept/reject (skipping shortlist) should not show an empty middle step as pending
  const reached = (s) => !!s.date

  return (
    <ol className="space-y-4">
      {steps.map((s, idx) => {
        const done = reached(s)
        const bad = s.key === 'rejected' && done
        return (
          <li key={s.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full ${bad ? 'bg-red-500' : done ? 'bg-indigo-600' : 'border-2 border-slate-300 bg-white'}`}
              />
              {idx < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className="pb-1">
              <p className={`text-sm font-medium capitalize ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.key}</p>
              <p className="text-xs text-slate-500">{done ? fmtDate(s.date) : 'Pending'}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
