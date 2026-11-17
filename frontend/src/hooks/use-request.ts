import { useCallback, useEffect, useState } from "react"

type Settled<T> = {
  load: () => Promise<T>
  attempt: number
  data: T | null
  error: unknown
}

export function useRequest<T>(load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled) {
          setSettled({ load, attempt, data, error: null })
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setSettled({ load, attempt, data: null, error })
        }
      }
    )
    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])
  const loading =
    !settled || settled.load !== load || settled.attempt !== attempt

  return {
    data: settled?.data ?? null,
    error: loading ? null : settled.error,
    loading,
    reload,
  }
}
