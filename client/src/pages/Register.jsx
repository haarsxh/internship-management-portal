import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../utils'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student', companyName: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
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
      const { confirm, ...payload } = form
      const user = await register(payload)
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
      <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-8 ">
        <h1 className="mb-6 text-4xl font-semibold">Create account</h1>
        <FormInput label="I am a" name="role" as="select" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="company">Company</option>
        </FormInput>
        <FormInput label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        {form.role === 'company' && (
          <FormInput label="Company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
        )}
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        <FormInput label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} />
        <button disabled={submitting} className="w-full rounded-full bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {submitting ? 'Creating...' : 'Sign up'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}
