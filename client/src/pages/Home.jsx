import { Link } from 'react-router-dom'
import InternshipCard from '../components/InternshipCard'
import Spinner from '../components/Spinner'
import useFetch from '../hooks/useFetch'
import useQuickLogin, { showDemo } from '../hooks/useQuickLogin'

const tiles = [
  { role: 'student', who: 'Students', line: 'Find it. Apply. Done.', text: 'Search by skill, location and stipend. Apply with your resume in seconds and follow every decision.' },
  { role: 'company', who: 'Companies', line: 'Hire the next generation.', text: 'Post internships, review applicants and move them from shortlisted to accepted in one place.' },
  { role: 'admin', who: 'Admins', line: 'See the whole picture.', text: 'Approve companies and track applications and postings with live platform statistics.' },
]

export default function Home() {
  const { data, loading } = useFetch('/internships', { limit: 3 })
  const { quickLogin, busy } = useQuickLogin()

  return (
    <div>
      <section className="bg-black px-4 pb-24 pt-20 text-center text-white">
        <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-7xl">Internships.</h1>
        <p className="mx-auto mt-2 max-w-3xl bg-gradient-to-r from-[#ff9f0a] via-[#ff375f] to-[#bf5af2] bg-clip-text text-4xl font-semibold text-transparent sm:text-6xl">
          Your career starts here.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-xl text-white/70">
          One portal for students, companies and campus coordinators.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/internships" className="rounded-full bg-indigo-600 px-5 py-2 text-[17px] text-white hover:bg-[#0077ed]">
            Browse internships
          </Link>
          <Link to="/register" className="rounded-full border border-[#2997ff] px-5 py-2 text-[17px] text-[#2997ff] hover:bg-[#2997ff] hover:text-black">
            Create account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1024px] px-4 py-20">
        <h2 className="mb-2 text-center text-4xl sm:text-5xl">Closing soon.</h2>
        <p className="mb-10 text-center text-xl text-slate-500">Apply before the deadline.</p>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.internships.map((i) => (
              <InternshipCard key={i._id} internship={i} />
            ))}
          </div>
        )}
        <p className="mt-8 text-center">
          <Link to="/internships" className="text-xl text-indigo-700 hover:underline">
            See all internships &rsaquo;
          </Link>
        </p>
      </section>

      <section className="bg-white px-4 py-20">
        <h2 className="mb-2 text-center text-4xl sm:text-5xl">Pick your portal.</h2>
        <p className="mb-10 text-center text-xl text-slate-500">
          {showDemo ? 'One tap to jump in with a demo account.' : 'Sign in to continue.'}
        </p>
        <div className="mx-auto grid max-w-[1024px] gap-5 md:grid-cols-3">
          {tiles.map((t) => (
            <div key={t.who} className="rounded-[28px] bg-slate-50 p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.who}</p>
              <h3 className="mt-2 text-3xl leading-tight">{t.line}</h3>
              <p className="mt-4 text-[17px] text-slate-500">{t.text}</p>
              {showDemo ? (
                <button
                  onClick={() => quickLogin(t.role)}
                  disabled={busy}
                  className="mt-6 rounded-full bg-indigo-600 px-5 py-2 text-[15px] text-white hover:bg-[#0077ed] disabled:opacity-60"
                >
                  Open {t.role} portal
                </button>
              ) : (
                <Link to="/login" className="mt-6 inline-block text-[17px] text-indigo-700 hover:underline">
                  Sign in &rsaquo;
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
        InternHub · Internship Management Portal
      </footer>
    </div>
  )
}
