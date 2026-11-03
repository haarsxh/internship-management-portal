import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../utils'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}`)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-8 ">
        <h1 className="mb-6 text-4xl font-semibold">Log in</h1>
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        <button disabled={submitting} className="w-full rounded-full bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {submitting ? 'Signing in...' : 'Log in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
