import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../utils'

const roles = [
  ['student', 'Student'],
  ['company', 'Company'],
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', companyName: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 6) e.password = 'Use at least 6 characters'
    if (form.role === 'company' && !form.companyName.trim()) e.companyName = 'Company name is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    try {
      const user = await register(form)
      toast.success(user.role === 'company' ? 'Account created. An admin must approve it before you can post.' : 'Account created')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="mb-6 text-4xl">Create account</h1>

        <div role="tablist" aria-label="Account type" className="mb-6 grid grid-cols-2 rounded-full bg-slate-50 p-1">
          {roles.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={form.role === value}
              onClick={() => setForm({ ...form, role: value })}
              className={`rounded-full py-2 text-sm transition ${form.role === value ? 'bg-white font-semibold shadow-sm' : 'text-slate-500'}`}
            >
              I'm a {label.toLowerCase()}
            </button>
          ))}
        </div>

        <FormInput label="Full name" name="name" autoComplete="name" autoFocus value={form.name} onChange={handleChange} error={errors.name} />
        {form.role === 'company' && (
          <FormInput label="Company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
        )}
        <FormInput label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <PasswordInput label="Password" name="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} />

        <button disabled={submitting} className="w-full rounded-full bg-indigo-600 py-2.5 text-[17px] text-white hover:bg-[#0077ed] disabled:opacity-60">
          {submitting ? 'Creating...' : 'Create account'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-700 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">Admin accounts are created by the platform team.</p>
      </form>
    </div>
  )
}
