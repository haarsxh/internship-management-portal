import { useState } from 'react'
import useFetch from '../hooks/useFetch'

const key = (id) => `dismissed-announcement-${id}`
const wasDismissed = (id) => {
  try {
    return localStorage.getItem(key(id)) === '1'
  } catch {
    return false
  }
}

// Site-wide notice from the admin; each user can dismiss it
export default function AnnouncementBanner() {
  const { data } = useFetch('/announcements/active')
  const [hidden, setHidden] = useState(null)
  const a = data?.announcement
  if (!a || hidden === a._id || wasDismissed(a._id)) return null

  const dismiss = () => {
    try {
      localStorage.setItem(key(a._id), '1')
    } catch {
      /* private mode: just hide for this visit */
    }
    setHidden(a._id)
  }

  return (
    <div role="status" className="bg-indigo-600 px-4 py-2 text-center text-sm text-white">
      <span>{a.message}</span>
      <button onClick={dismiss} aria-label="Dismiss announcement" className="ml-3 text-white/80 hover:text-white">
        &times;
      </button>
    </div>
  )
}
