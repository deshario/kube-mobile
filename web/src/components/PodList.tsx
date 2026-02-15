import { Box, Stack, Card, CardActionArea, CardContent, TextField, Typography, Chip, Alert, Skeleton } from '@mui/material'
import { Memory } from '@mui/icons-material'
import type { Pod } from '../types'

interface PodListProps {
  pods: Pod[]
  search: string
  error: string | null
  loading?: boolean
  onSearchChange: (value: string) => void
  onSelect: (pod: Pod) => void
}

export function PodList({ pods, search, error, loading, onSearchChange, onSelect }: PodListProps) {
  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 64px)">
      <SearchInput value={search} onChange={onSearchChange} />
      <Box flex={1} overflow="auto" px={2} pb={2}>
        {error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Stack spacing={1}>
            {[...Array(6)].map((_, index) => (
              <PodCardSkeleton key={index} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={1}>
            {pods.map((pod) => (
              <PodCard key={pod.name} pod={pod} onSelect={onSelect} />
            ))}
            {pods.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No pods found in this namespace
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

function PodCardSkeleton() {
  return (
    <Card>
      <CardContent sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={180} />
          </Stack>
          <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
      </CardContent>
    </Card>
  )
}

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <Box p={2} pb={1}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search pods..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  )
}

interface PodCardProps {
  pod: Pod
  onSelect: (pod: Pod) => void
}

function PodCard({ pod, onSelect }: PodCardProps) {
  const isRunning = pod.status === 'Running'

  return (
    <Card>
      <CardActionArea onClick={() => onSelect(pod)}>
        <CardContent sx={{ py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Memory fontSize="small" color="action" />
              <Typography variant="body2" fontFamily="monospace">
                {pod.name}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={pod.status}
              color={isRunning ? 'success' : 'warning'}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
