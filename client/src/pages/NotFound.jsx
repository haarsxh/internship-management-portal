import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-5xl font-bold text-slate-300">404</h1>
      <p className="mt-2 text-slate-600">This page doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
        Back to home
      </Link>
    </div>
  )
}
