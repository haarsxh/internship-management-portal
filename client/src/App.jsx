import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import InternshipList from './pages/InternshipList'
import InternshipDetails from './pages/InternshipDetails'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import MyApplications from './pages/MyApplications'
import MyInternships from './pages/MyInternships'
import InternshipForm from './pages/InternshipForm'
import Applicants from './pages/Applicants'
import AdminUsers from './pages/AdminUsers'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internships" element={<InternshipList />} />
        <Route path="/internships/:id" element={<InternshipDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="/applications" element={<MyApplications />} />
            </Route>

            <Route element={<ProtectedRoute roles={['company']} />}>
              <Route path="/my-internships" element={<MyInternships />} />
              <Route path="/my-internships/new" element={<InternshipForm />} />
              <Route path="/my-internships/:id/edit" element={<InternshipForm />} />
              <Route path="/my-internships/:id/applicants" element={<Applicants />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
