import { Link } from 'react-router-dom'
import InternshipCard from '../components/InternshipCard'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import useFetch from '../hooks/useFetch'

export default function SavedInternships() {
  const { data, loading, error, reload } = useFetch('/student/saved')
  return (
    <div>
      <h1 className="mb-6 text-4xl">Saved internships</h1>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.internships.length === 0 ? (
        <EmptyState title="Nothing saved yet" message="Tap the bookmark on any internship to keep it here.">
          <Link to="/internships" className="text-indigo-700 hover:underline">Browse internships</Link>
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {data.internships.map((i) => (
            <InternshipCard key={i._id} internship={i} onSavedChange={reload} />
          ))}
        </div>
      )}
    </div>
  )
}
