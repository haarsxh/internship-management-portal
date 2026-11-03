import { Link } from 'react-router-dom'
import { fmtDate } from '../utils'

export default function InternshipCard({ internship: i }) {
  return (
    <Link
      to={`/internships/${i._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">{i.title}</h3>
      <p className="text-sm text-slate-500">{i.company?.companyName || i.company?.name}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-slate-100 px-2 py-1">{i.location}</span>
        <span className="rounded bg-slate-100 px-2 py-1 capitalize">{i.mode}</span>
        <span className="rounded bg-slate-100 px-2 py-1">{i.durationMonths} mo</span>
        <span className="rounded bg-green-50 px-2 py-1 text-green-700">
          {i.stipend ? `₹${i.stipend.toLocaleString('en-IN')}/mo` : 'Unpaid'}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {i.skills?.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
            {s}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">Apply by {fmtDate(i.deadline)}</p>
    </Link>
  )
}
