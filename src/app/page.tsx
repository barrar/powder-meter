import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import { Suspense } from 'react'
import SnowForecast from '../components/SnowForecast'

export default async function Page() {
  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(19,33,61,0.9), rgba(30,58,138,0.9))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 80px rgba(6, 12, 28, 0.35)',
            }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip label="Mt. Bachelor" color="primary" variant="outlined" size="small" />
                <Chip label="Live NOAA feed" color="secondary" size="small" />
                <Chip label="Bluebird detector" variant="filled" size="small" />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="h3" component="h1">
                  Snow outlook, reimagined
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 820 }}>
                  We surface powder windows, precipitation warnings, and daypart details in one modern view so you
                  can chase the cleanest turns without refreshing a dozen tabs.
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Suspense fallback={<Typography variant="body2">Loading NOAA forecast…</Typography>}>
            <SnowForecast />
          </Suspense>
        </Stack>
      </Container>
    </Box>
  )
}
