import { useState } from 'react'
import { Box, Typography, TextField, Button, Stack } from '@mui/material'

interface NamespaceInputProps {
  contextName: string
  onSubmit: (namespace: string) => void
}

export function NamespaceInput({ contextName, onSubmit }: NamespaceInputProps) {
  const [namespace, setNamespace] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (namespace.trim()) {
      onSubmit(namespace.trim())
    }
  }

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        {contextName}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter the namespace to view pods from
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Namespace"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="e.g. default, staging, production"
            fullWidth
            autoFocus
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!namespace.trim()}
            fullWidth
          >
            View Pods
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
