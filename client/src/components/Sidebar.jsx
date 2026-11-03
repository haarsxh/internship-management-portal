import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menus = {
  student: [
    ['/dashboard', 'Dashboard'],
    ['/applications', 'My Applications'],
    ['/profile', 'Profile'],
  ],
  company: [
    ['/dashboard', 'Dashboard'],
    ['/my-internships', 'My Internships'],
    ['/my-internships/new', 'Post Internship'],
    ['/profile', 'Profile'],
  ],
  admin: [
    ['/dashboard', 'Dashboard'],
    ['/admin/users', 'Manage Users'],
    ['/profile', 'Profile'],
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white/70 backdrop-blur md:w-60 md:border-b-0 md:bg-transparent md:pl-4 md:pt-10">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:p-0">
        {menus[user.role].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                isActive ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
