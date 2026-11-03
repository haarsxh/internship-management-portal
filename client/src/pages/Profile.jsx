import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import FormInput from '../components/FormInput'
import { useAuth } from '../context/AuthContext'
import { errMsg, fileUrl } from '../utils'

export default function Profile() {
  const { user, setUser } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: user.name,
    companyName: user.companyName || '',
    website: user.website || '',
    phone: user.profile?.phone || '',
    college: user.profile?.college || '',
    branch: user.profile?.branch || '',
    skills: (user.profile?.skills || []).join(', '),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter a 10-digit phone number'
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      const { data } = await api.put('/auth/me', form)
      setUser(data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files[0]
    if (!file) return toast.error('Choose a PDF first')
    if (file.type !== 'application/pdf' || file.size > 2 * 1024 * 1024) return toast.error('Resume must be a PDF under 2MB')
    const body = new FormData()
    body.append('resume', file)
    setUploading(true)
    try {
      const { data } = await api.post('/auth/me/resume', body)
      setUser(data.user)
      fileRef.current.value = ''
      toast.success('Resume uploaded')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <form onSubmit={handleSave} noValidate className="rounded-xl border border-slate-200 bg-white p-6">
        <FormInput label="Email" name="email" value={user.email} disabled />
        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        {user.role === 'company' && (
          <>
            <FormInput label="Company name" name="companyName" value={form.companyName} onChange={handleChange} />
            <FormInput label="Website" name="website" value={form.website} onChange={handleChange} />
          </>
        )}
        {user.role === 'student' && (
          <>
            <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
            <FormInput label="College" name="college" value={form.college} onChange={handleChange} />
            <FormInput label="Branch" name="branch" value={form.branch} onChange={handleChange} />
            <FormInput label="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} />
          </>
        )}
        <button disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {user.role === 'student' && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 font-semibold">Resume</h2>
          {user.profile?.resumeUrl ? (
            <a href={fileUrl(user.profile.resumeUrl)} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
              View current resume
            </a>
          ) : (
            <p className="text-sm text-slate-500">No resume uploaded.</p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <input ref={fileRef} type="file" accept="application/pdf" className="text-sm" />
            <button type="button" disabled={uploading} onClick={handleUpload} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
