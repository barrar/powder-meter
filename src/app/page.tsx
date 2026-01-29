import LocationMenu from "@/components/LocationMenu";
import SnowForecast from "@/components/SnowForecast";
import { surfaceGradient } from "@/data/chartStyles";
import { forecastLocations, forecastStates, getForecastLocation, getForecastLocationsForState } from "@/data/forecastLocations";
import { resolveTimeZoneId, timeZoneOptions } from "@/data/timeZones";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Suspense } from "react";

type SearchParams = {
  location?: string | string[];
  timezone?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

const resolveParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const resolveForecastSelection = (searchParams?: SearchParams) => {
  const locationParam = resolveParam(searchParams?.location);
  const timeZoneValue = resolveTimeZoneId(searchParams?.timezone);
  const locationFromParam = getForecastLocation(locationParam);
  const resolvedState = locationFromParam.state;
  const stateLocations = getForecastLocationsForState(resolvedState);
  const location = stateLocations.find((item) => item.id === locationFromParam.id) ?? stateLocations[0] ?? locationFromParam;

  return {
    locationId: location.id,
    timeZoneValue,
    menu: {
      locations: forecastLocations,
      states: forecastStates,
      stateValue: resolvedState,
      value: location.id,
      timeZoneOptions,
      timeZoneValue,
    },
  };
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

          <Box
            component="footer"
            sx={{
              mt: { xs: 4, md: 5 },
              pt: 2,
              borderTop: "1px solid rgba(226, 232, 255, 0.2)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {`© ${new Date().getFullYear()} Jeremiah Barrar`}
              </Typography>
              <Button
                href="https://github.com/barrar/powder-meter"
                target="_blank"
                rel="noreferrer"
                color="primary"
                variant="contained"
                sx={{ textTransform: "none" }}
              >
                Source Code on GitHub
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
