import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Standardizes the loading / error / data / retry pattern used by every
 * dashboard page in this app. `queryFn` should be a stable callback (wrap in
 * useCallback at the call site, or pass deps so this hook can re-run).
 *
 * Usage:
 *   const { data, loading, error, refetch } = useSupabaseQuery(
 *     () => listPublishedEvents(), [], { initialData: [] }
 *   )
 */
export function useSupabaseQuery(queryFn, deps = [], { initialData = null, enabled = true } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const run = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      if (mounted.current) setData(result)
    } catch (err) {
      if (mounted.current) setError(err)
    } finally {
      if (mounted.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  return { data, setData, loading, error, refetch: run }
}