import { useEffect, useRef } from 'react'
import { Box, Stack, Button } from '@mui/material'
import { Pause, PlayArrow, Delete, ContentCopy } from '@mui/icons-material'

interface LogViewerProps {
  logs: string
  isPaused: boolean
  onTogglePause: () => void
  onClear: () => void
  onCopy: () => void
}

export function LogViewer({ logs, isPaused, onTogglePause, onClear, onCopy }: LogViewerProps) {
  const logRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (!isPaused && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs, isPaused])

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 64px)">
      <LogControls
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onClear={onClear}
        onCopy={onCopy}
      />
      <LogOutput ref={logRef} logs={logs} />
    </Box>
  )
}

interface LogControlsProps {
  isPaused: boolean
  onTogglePause: () => void
  onClear: () => void
  onCopy: () => void
}

function LogControls({ isPaused, onTogglePause, onClear, onCopy }: LogControlsProps) {
  return (
    <Stack direction="row" spacing={1} p={2}>
      <Button
        size="small"
        variant={isPaused ? 'contained' : 'outlined'}
        startIcon={isPaused ? <PlayArrow /> : <Pause />}
        onClick={onTogglePause}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </Button>
      <Button size="small" variant="outlined" startIcon={<Delete />} onClick={onClear}>
        Clear
      </Button>
      <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={onCopy}>
        Copy
      </Button>
    </Stack>
  )
}

interface LogOutputProps {
  logs: string
}

import { forwardRef } from 'react'

const LogOutput = forwardRef<HTMLPreElement, LogOutputProps>(({ logs }, ref) => (
  <Box
    ref={ref}
    component="pre"
    flex={1}
    overflow="auto"
    m={0}
    p={2}
    bgcolor="#0a0a0a"
    fontFamily="monospace"
    fontSize={12}
    lineHeight={1.6}
    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
  >
    {logs || 'Waiting for logs...'}
  </Box>
))

LogOutput.displayName = 'LogOutput'
