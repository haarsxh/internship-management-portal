import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const link = ({ isActive }) => `text-sm ${isActive ? 'font-semibold text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-700">
          InternHub
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/internships" className={link}>
            Browse
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={link}>
                Dashboard
              </NavLink>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.name} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs capitalize">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>
                Login
              </NavLink>
              <Link to="/register" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
