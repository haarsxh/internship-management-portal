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
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col">
        {menus[user.role].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
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
