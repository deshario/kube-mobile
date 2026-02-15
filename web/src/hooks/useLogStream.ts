import { useState, useRef, useCallback } from 'react'
import type { Pod } from '../types'

export function useLogStream() {
  const [logs, setLogs] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const bufferRef = useRef('')

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const connect = useCallback((pod: Pod) => {
    wsRef.current?.close()
    wsRef.current = null
    bufferRef.current = ''
    setLogs('')
    setIsPaused(false)

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${location.host}/ws/logs`)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'start',
        namespace: pod.namespace,
        pod: pod.name,
      }))
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const text = data.type === 'log'
          ? data.data
          : `[${data.type?.toUpperCase()}] ${data.message}\n`
        bufferRef.current += text
        setLogs(bufferRef.current)
      } catch {
        bufferRef.current += e.data
        setLogs(bufferRef.current)
      }
    }

    wsRef.current = ws
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      if (prev) setLogs(bufferRef.current)
      return !prev
    })
  }, [])

  const clear = useCallback(() => {
    bufferRef.current = ''
    setLogs('')
  }, [])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(bufferRef.current)
  }, [])

  return {
    logs,
    isPaused,
    connect,
    disconnect,
    togglePause,
    clear,
    copy,
  }
}
