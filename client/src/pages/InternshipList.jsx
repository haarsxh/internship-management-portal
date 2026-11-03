import { useState } from 'react'
import InternshipCard from '../components/InternshipCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'

export default function InternshipList() {
  const [filters, setFilters] = useState({ q: '', mode: '', location: '', minStipend: '' })
  const [applied, setApplied] = useState({})
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useFetch('/internships', { ...applied, page })

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setApplied(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))
  }
  const handleReset = () => {
    setFilters({ q: '', mode: '', location: '', minStipend: '' })
    setApplied({})
    setPage(1)
  }

  const inputCls = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Browse internships</h1>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3">
        <input name="q" value={filters.q} onChange={handleChange} placeholder="Search title or skill" className={`${inputCls} min-w-52 flex-1`} />
        <input name="location" value={filters.location} onChange={handleChange} placeholder="Location" className={inputCls} />
        <select name="mode" value={filters.mode} onChange={handleChange} className={inputCls}>
          <option value="">Any mode</option>
          <option value="remote">Remote</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input name="minStipend" type="number" min="0" value={filters.minStipend} onChange={handleChange} placeholder="Min stipend" className={`${inputCls} w-32`} />
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">Search</button>
        <button type="button" onClick={handleReset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-white">
          Reset
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.internships.length === 0 ? (
        <EmptyState title="No internships found" message="Try changing your search or filters." />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">{data.total} result(s)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.internships.map((i) => (
              <InternshipCard key={i._id} internship={i} />
            ))}
          </div>
          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">
                Prev
              </button>
              <span>
                Page {data.page} of {data.pages}
              </span>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
