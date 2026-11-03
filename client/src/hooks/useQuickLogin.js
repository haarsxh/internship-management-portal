import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../utils'

// Accounts created by `npm run seed`. Hide one-tap buttons with VITE_DEMO_LOGIN=false.
export const demoAccounts = {
  student: { label: 'Student', email: 'harshverma@student.com', password: 'student123' },
  company: { label: 'Company', email: 'hr@acme.com', password: 'company123' },
  admin: { label: 'Admin', email: 'admin@portal.com', password: 'admin123' },
}
export const showDemo = import.meta.env.VITE_DEMO_LOGIN !== 'false'

// Signs in with the given credentials, then opens the dashboard (or the page the user came from)
export default function useQuickLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)

  const signIn = async (email, password) => {
    setBusy(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}`)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const quickLogin = (role) => signIn(demoAccounts[role].email, demoAccounts[role].password)
  return { signIn, quickLogin, busy }
}
