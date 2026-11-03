import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const link = ({ isActive }) =>
    `text-xs transition-colors ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}`

  return (
    <header className="sticky top-0 z-40 bg-[#1d1d1f]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-4">
        <Link to="/" className="text-[15px] font-semibold tracking-tight text-white">
          InternHub
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/internships" className={link}>
            Browse
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={link}>
                Dashboard
              </NavLink>
              <span className="hidden text-xs text-white/60 sm:inline">
                {user.name} · <span className="capitalize">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="text-xs text-white/80 hover:text-white">
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>
                Sign in
              </NavLink>
              <Link to="/register" className="rounded-full bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-500">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
