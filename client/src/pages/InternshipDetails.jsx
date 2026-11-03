import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import StatusBadge from '../components/StatusBadge'
import FormInput from '../components/FormInput'
import useFetch from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { errMsg, fmtDate } from '../utils'

export default function InternshipDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useFetch(`/internships/${id}`)
  const [open, setOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  if (loading) return <Spinner />
  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} onRetry={reload} /></div>

  const { internship: i, application } = data
  const closed = i.status !== 'open' || new Date(i.deadline) < new Date()

  const handleApply = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files[0]
    if (file && (file.type !== 'application/pdf' || file.size > 2 * 1024 * 1024)) {
      setFileError('Resume must be a PDF under 2MB')
      return
    }
    if (!file && !user.profile?.resumeUrl) {
      setFileError('Attach a PDF resume (or upload one in your profile)')
      return
    }
    setFileError('')
    const body = new FormData()
    body.append('coverLetter', coverLetter)
    if (file) body.append('resume', file)
    setSubmitting(true)
    try {
      await api.post(`/internships/${id}/apply`, body)
      toast.success('Application submitted')
      setOpen(false)
      reload()
    } catch (err) {
      toast.error(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-indigo-600 hover:underline">
        &larr; Back
      </button>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold">{i.title}</h1>
            <p className="text-slate-500">
              {i.company?.companyName || i.company?.name}
              {i.company?.website && (
                <a href={i.company.website} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 hover:underline">
                  Website
                </a>
              )}
            </p>
          </div>
          <StatusBadge status={closed ? 'closed' : 'open'} />
        </div>

        <dl className="my-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ['Location', i.location],
            ['Mode', i.mode],
            ['Duration', `${i.durationMonths} months`],
            ['Stipend', i.stipend ? `₹${i.stipend.toLocaleString('en-IN')}/mo` : 'Unpaid'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-slate-400">{k}</dt>
              <dd className="font-medium capitalize">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mb-1 font-semibold">About the role</h2>
        <p className="whitespace-pre-line text-sm text-slate-600">{i.description}</p>
        <div className="mt-4 flex flex-wrap gap-1">
          {i.skills.map((s) => (
            <span key={s} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Apply by {fmtDate(i.deadline)}</p>

        <div className="mt-6">
          {!user ? (
            <Link to="/login" state={{ from: { pathname: `/internships/${id}` } }} className="rounded-full bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700">
              Log in to apply
            </Link>
          ) : user.role !== 'student' ? (
            <p className="text-sm text-slate-500">Only students can apply.</p>
          ) : application ? (
            <p className="text-sm">
              You applied on {fmtDate(application.createdAt)} — status: <StatusBadge status={application.status} />
            </p>
          ) : (
            <button
              disabled={closed}
              onClick={() => setOpen(true)}
              className="rounded-full bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {closed ? 'Applications closed' : 'Apply now'}
            </button>
          )}
        </div>
      </div>

      <Modal open={open} title={`Apply: ${i.title}`} onClose={() => setOpen(false)}>
        <form onSubmit={handleApply}>
          <FormInput
            label="Cover letter (optional)"
            name="coverLetter"
            as="textarea"
            rows={5}
            maxLength={2000}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <FormInput label="Resume (PDF, max 2MB)" name="resume" type="file" accept="application/pdf" ref={fileRef} error={fileError} />
          <button disabled={submitting} className="w-full rounded-full bg-indigo-600 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
