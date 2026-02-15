import { useState, useEffect, useCallback, useRef } from 'react'
import type { Context, Pod } from '../types'

export function useSdmStatus() {
  const [connected, setConnected] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const mountedRef = useRef(true)

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/sdm/status')
      const data = await res.json()
      if (mountedRef.current) {
        setConnected(data.connected)
        setNeedsLogin(data.needsLogin || false)
      }
    } catch {
      if (mountedRef.current) {
        setConnected(false)
        setNeedsLogin(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    check()
    const interval = setInterval(check, 30000)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [check])

  const reconnect = useCallback(async () => {
    setReconnecting(true)
    try {
      const res = await fetch('/api/sdm/reconnect', { method: 'POST' })
      const data = await res.json()
      await check()
      return data
    } finally {
      setReconnecting(false)
    }
  }, [check])

  return { connected, needsLogin, reconnecting, reconnect }
}

export function useContexts() {
  const [contexts, setContexts] = useState<Context[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchContexts = async () => {
      const res = await fetch('/api/contexts')
      const data = await res.json()
      if (mounted) {
        setContexts(data.contexts)
        setLoading(false)
      }
    }

    fetchContexts()

    return () => {
      mounted = false
    }
  }, [])

  const switchContext = useCallback(async (contextId: string) => {
    await fetch('/api/contexts/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId }),
    })
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/contexts')
    const data = await res.json()
    setContexts(data.contexts)
    setLoading(false)
  }, [])

  return { contexts, loading, switchContext, refetch }
}

export function usePods(namespace: string | null, search: string) {
  const [allPods, setAllPods] = useState<Pod[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!namespace) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pods?namespace=${namespace}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setAllPods([])
      } else {
        setAllPods(data.pods || [])
      }
    } catch {
      setError('Failed to fetch pods')
      setAllPods([])
    }
    setLoading(false)
  }, [namespace])

  useEffect(() => {
    if (namespace) {
      let mounted = true

      const load = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(`/api/pods?namespace=${namespace}`)
          const data = await res.json()
          if (mounted) {
            if (data.error) {
              setError(data.error)
              setAllPods([])
            } else {
              setAllPods(data.pods || [])
            }
            setLoading(false)
          }
        } catch {
          if (mounted) {
            setError('Failed to fetch pods')
            setAllPods([])
            setLoading(false)
          }
        }
      }

      load()
      return () => { mounted = false }
    }
  }, [namespace])

  // Filter locally - instant, no race conditions
  const pods = search
    ? allPods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : allPods

  return { pods, loading, error, refetch }
}
