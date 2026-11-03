import { Link } from 'react-router-dom'
import { fmtDate } from '../utils'

export default function InternshipCard({ internship: i }) {
  return (
    <Link
      to={`/internships/${i._id}`}
      className="group block rounded-2xl bg-white p-6 transition duration-300 hover:scale-[1.02] hover:shadow-xl"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{i.company?.companyName || i.company?.name}</p>
      <h3 className="mt-1 text-xl leading-snug text-slate-900">{i.title}</h3>
      <p className="mt-2 text-sm text-slate-500">
        {i.location} · <span className="capitalize">{i.mode}</span> · {i.durationMonths} months
      </p>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {i.stipend ? `₹${i.stipend.toLocaleString('en-IN')}` : 'Unpaid'}
        {i.stipend > 0 && <span className="text-sm font-normal text-slate-400"> /month</span>}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {i.skills?.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="text-slate-400">Apply by {fmtDate(i.deadline)}</span>
        <span className="text-indigo-700 group-hover:underline">Learn more &rsaquo;</span>
      </div>
    </Link>
  )
}
