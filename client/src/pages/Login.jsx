import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import useQuickLogin, { demoAccounts, showDemo } from '../hooks/useQuickLogin'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { signIn, quickLogin, busy: submitting } = useQuickLogin()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (!Object.keys(e).length) signIn(form.email, form.password)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="mb-6 text-4xl">Sign in</h1>
        <FormInput label="Email" name="email" type="email" autoComplete="email" autoFocus value={form.email} onChange={handleChange} error={errors.email} />
        <PasswordInput label="Password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} />
        <button disabled={submitting} className="w-full rounded-full bg-indigo-600 py-2.5 text-[17px] text-white hover:bg-[#0077ed] disabled:opacity-60">
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="text-indigo-700 hover:underline">
            Create an account
          </Link>
        </p>
      </form>

      {showDemo && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Quick demo sign in</p>
          <div className="flex justify-center gap-3">
            {Object.entries(demoAccounts).map(([role, a]) => (
              <button
                key={role}
                type="button"
                disabled={submitting}
                onClick={() => quickLogin(role)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm hover:border-indigo-600 hover:text-indigo-700 disabled:opacity-60"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
