import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import { Suspense } from 'react'
import LocationMenu from '../components/LocationMenu'
import SnowForecast from '../components/SnowForecast'
import { forecastLocations, getForecastLocation } from '../data/forecastLocations'

type PageProps = {
  searchParams?: { location?: string | string[] } | Promise<{ location?: string | string[] }>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const locationParam = Array.isArray(resolvedSearchParams?.location)
    ? resolvedSearchParams?.location[0]
    : resolvedSearchParams?.location
  const location = getForecastLocation(locationParam)

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
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Typography variant="h3" component="h1">
                    {location.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 820 }}>
                    {location.description}
                  </Typography>
                </Stack>
                <LocationMenu locations={forecastLocations} value={location.id} />
              </Stack>
            </Stack>
          </Paper>

          <Suspense fallback={<Typography variant="body2">Loading NOAA forecast…</Typography>}>
            <SnowForecast locationId={location.id} />
          </Suspense>
        </Stack>
      </Container>
    </Box>
  )
}
