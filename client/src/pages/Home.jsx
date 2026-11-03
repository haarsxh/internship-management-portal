import { Link } from 'react-router-dom'
import InternshipCard from '../components/InternshipCard'
import Spinner from '../components/Spinner'
import useFetch from '../hooks/useFetch'

export default function Home() {
  const { data, loading } = useFetch('/internships', { limit: 3 })

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-700 to-indigo-500 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">Find your next internship</h1>
        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
          Students discover and apply. Companies post and shortlist. Admins keep everything running.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/internships" className="rounded-lg bg-white px-5 py-2.5 font-medium text-indigo-700 hover:bg-indigo-50">
            Browse internships
          </Link>
          <Link to="/register" className="rounded-lg border border-white/60 px-5 py-2.5 font-medium hover:bg-white/10">
            Create account
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold">Closing soon</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.internships.map((i) => (
              <InternshipCard key={i._id} internship={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
