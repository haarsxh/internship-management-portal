import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import { errMsg } from '../utils'

// GET helper exposing loading / error / data states and a reload function
export default function useFetch(url, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const key = JSON.stringify(params || {})

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return api
      .get(url, { params: JSON.parse(key) })
      .then((res) => setData(res.data))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false))
  }, [url, key])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
