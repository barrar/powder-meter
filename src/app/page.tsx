import { Suspense } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import PageFooter from "@/app/_components/PageFooter";
import { resolveForecastSelection, type SearchParams } from "@/app/_lib/forecastSelection";
import SnowForecast from "@/components/SnowForecast";
import LocationMenu from "@/components/location/LocationMenu";
import { surfaceGradient } from "@/data/chartStyles";

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { locationId, timeZoneValue, menu } = resolveForecastSelection(resolvedSearchParams);

  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 0, md: 1 }, py: 3 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              background: surfaceGradient,
              boxShadow: "0 20px 50px rgba(6, 12, 28, 0.35)",
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="h3" component="h1">
                  Powder Meter
                </Typography>
                <Typography variant="body1">A quick, visual snow-centric forecast</Typography>
              </Stack>
              <LocationMenu {...menu} />
            </Stack>
          </Paper>

          <Suspense fallback={<Typography variant="h4">Loading forecast...</Typography>}>
            <SnowForecast locationId={locationId} timeZoneId={timeZoneValue} />
          </Suspense>

          <PageFooter />
        </Stack>
      </Container>
    </Box>
  );
}
