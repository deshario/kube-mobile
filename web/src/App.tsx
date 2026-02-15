import { useState, useMemo } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert, Box, Typography, useMediaQuery } from '@mui/material'
import { Header, ContextList, NamespaceInput, PodList, LogViewer } from './components'
import { useSdmStatus, useContexts, usePods, useLogStream } from './hooks'
import type { View, Context, Pod } from './types'

const green = {
  main: '#4caf50',
  light: '#81c784',
  dark: '#388e3c',
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => createTheme({
    palette: {
      mode: prefersDark ? 'dark' : 'light',
      primary: green,
    },
  }), [prefersDark])

  const [view, setView] = useState<View>('contexts')
  const [currentContext, setCurrentContext] = useState<Context | null>(null)
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null)
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null)

  const { connected: sdmConnected, needsLogin, reconnecting, reconnect } = useSdmStatus()
  const { contexts, loading: contextsLoading, switchContext } = useContexts()
  const { pods, loading: podsLoading, error: podsError } = usePods(selectedNamespace, search)
  const logStream = useLogStream()

  const handleReconnect = async () => {
    const result = await reconnect()
    setToast({
      message: result.message,
      severity: result.success ? 'success' : 'error',
    })
  }

  const handleSelectContext = async (ctx: Context) => {
    await switchContext(ctx.id)
    setCurrentContext(ctx)
    setView('namespaces')
  }

  const handleSelectNamespace = (namespace: string) => {
    setSelectedNamespace(namespace)
    setSearch('')
    setView('pods')
  }

  const handleSelectPod = (pod: Pod) => {
    setSelectedPod(pod)
    logStream.connect(pod)
    setView('logs')
  }

  const handleSearch = (value: string) => {
    setSearch(value)
  }

  const handleBack = () => {
    if (view === 'logs') {
      logStream.disconnect()
      setView('pods')
    } else if (view === 'pods') {
      setView('namespaces')
    } else if (view === 'namespaces') {
      setView('contexts')
    }
  }

  const getTitle = () => {
    if (view === 'contexts') return 'Kube Mobile'
    if (view === 'namespaces') return currentContext?.name ?? ''
    if (view === 'pods') return selectedNamespace ?? ''
    return selectedPod?.name ?? ''
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header
        title={getTitle()}
        showBack={view !== 'contexts'}
        onBack={handleBack}
        sdmConnected={sdmConnected}
        sdmNeedsLogin={needsLogin}
        sdmReconnecting={reconnecting}
        onReconnect={handleReconnect}
      />

      {view === 'contexts' && (
        sdmConnected ? (
          <ContextList contexts={contexts} loading={contextsLoading} onSelect={handleSelectContext} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              SDM Not Connected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {needsLogin
                ? 'Run "sdm login" on your Mac to connect'
                : 'Tap "Reconnect" above or check SDM on your Mac'}
            </Typography>
          </Box>
        )
      )}

      {view === 'namespaces' && (
        <NamespaceInput
          contextName={currentContext?.name ?? ''}
          onSubmit={handleSelectNamespace}
        />
      )}

      {view === 'pods' && (
        <PodList
          pods={pods}
          search={search}
          error={podsError}
          loading={podsLoading}
          onSearchChange={handleSearch}
          onSelect={handleSelectPod}
        />
      )}

      {view === 'logs' && (
        <LogViewer
          logs={logStream.logs}
          isPaused={logStream.isPaused}
          onTogglePause={logStream.togglePause}
          onClear={logStream.clear}
          onCopy={logStream.copy}
        />
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
