import { AppBar, Toolbar, Typography, Chip, IconButton, Button, CircularProgress } from '@mui/material'
import { ArrowBack, Refresh } from '@mui/icons-material'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  sdmConnected: boolean
  sdmNeedsLogin?: boolean
  sdmReconnecting?: boolean
  onReconnect?: () => void
}

export function Header({
  title,
  showBack,
  onBack,
  sdmConnected,
  sdmNeedsLogin,
  sdmReconnecting,
  onReconnect,
}: HeaderProps) {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {showBack && (
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          {title}
        </Typography>
        {sdmConnected ? (
          <Chip size="small" label="SDM Connected" color="success" />
        ) : (
          <>
            {!sdmNeedsLogin && onReconnect && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={onReconnect}
                disabled={sdmReconnecting}
                startIcon={sdmReconnecting ? <CircularProgress size={16} /> : <Refresh />}
                sx={{ mr: 1 }}
              >
                {sdmReconnecting ? 'Reconnecting...' : 'Reconnect'}
              </Button>
            )}
            <Chip
              size="small"
              label={sdmNeedsLogin ? 'Login on Mac' : 'SDM Offline'}
              color="error"
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
