import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Skeleton } from '@mui/material'
import { Cloud, ChevronRight } from '@mui/icons-material'
import type { Context } from '../types'

interface ContextListProps {
  contexts: Context[]
  loading?: boolean
  onSelect: (ctx: Context) => void
}

const ROW_COLORS = ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350', '#26c6da', '#ff7043', '#5c6bc0']

export function ContextList({ contexts, loading, onSelect }: ContextListProps) {
  const showSkeleton = loading || contexts.length === 0

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Select Cluster
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {showSkeleton ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell width={40}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={`${60 + (index * 10) % 30}%`} />
                  </TableCell>
                  <TableCell width={40} align="right">
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              contexts.map((ctx, index) => (
                <TableRow
                  key={ctx.id}
                  hover
                  onClick={() => onSelect(ctx)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell width={40}>
                    <Cloud sx={{ color: ROW_COLORS[index % ROW_COLORS.length] }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{ctx.name}</Typography>
                  </TableCell>
                  <TableCell width={40} align="right">
                    <ChevronRight color="action" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
