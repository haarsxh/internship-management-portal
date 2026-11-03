import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'
import { errMsg, toInputDate } from '../utils'

const empty = { title: '', description: '', location: '', mode: 'onsite', stipend: 0, durationMonths: 2, skills: '', deadline: '' }

export default function InternshipForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(!!id)
  const [submitting, setSubmitting] = useState(false)

  // Edit mode: load the existing internship
  useEffect(() => {
    if (!id) return
    api
      .get(`/internships/${id}`)
      .then(({ data }) => {
        const i = data.internship
        setForm({ ...i, skills: i.skills.join(', '), deadline: toInputDate(i.deadline) })
      })
      .catch((err) => {
        toast.error(errMsg(err))
        navigate('/my-internships')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (Number(form.stipend) < 0) e.stipend = 'Stipend cannot be negative'
    if (Number(form.durationMonths) < 1) e.durationMonths = 'At least 1 month'
    if (!form.deadline) e.deadline = 'Deadline is required'
    else if (!id && new Date(form.deadline) < new Date(new Date().toDateString())) e.deadline = 'Deadline must be in the future'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      mode: form.mode,
      stipend: Number(form.stipend),
      durationMonths: Number(form.durationMonths),
      skills: form.skills,
      deadline: form.deadline,
    }
    try {
      if (id) await api.put(`/internships/${id}`, payload)
      else await api.post('/internships', payload)
      toast.success(id ? 'Internship updated' : 'Internship posted')
      navigate('/my-internships')
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-4xl font-semibold">{id ? 'Edit internship' : 'Post an internship'}</h1>
      <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-6">
        <FormInput label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} />
        <FormInput label="Description" name="description" as="textarea" rows={5} value={form.description} onChange={handleChange} error={errors.description} />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} error={errors.location} />
          <FormInput label="Mode" name="mode" as="select" value={form.mode} onChange={handleChange}>
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </FormInput>
          <FormInput label="Stipend (₹/month)" name="stipend" type="number" min="0" value={form.stipend} onChange={handleChange} error={errors.stipend} />
          <FormInput label="Duration (months)" name="durationMonths" type="number" min="1" value={form.durationMonths} onChange={handleChange} error={errors.durationMonths} />
          <FormInput label="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} />
          <FormInput label="Application deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} error={errors.deadline} />
        </div>
        <div className="flex gap-3">
          <button disabled={submitting} className="rounded-full bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-60">
            {submitting ? 'Saving...' : id ? 'Save changes' : 'Post internship'}
          </button>
          <button type="button" onClick={() => navigate('/my-internships')} className="rounded-full border border-slate-300 px-5 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
