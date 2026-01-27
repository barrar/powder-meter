"use client";

import { Grid, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { ForecastPoint } from "@/data/getWeatherData";
import type { TimeZoneId } from "@/data/timeZones";
import {
  buildBluebirdWindows,
  buildChartData,
  buildChartLayout,
  buildWarningDetails,
  buildWarnings,
  buildXAxisTicks,
  createTimeFormatters,
  legendItems,
  lineSeries,
} from "@/components/customChartData";
import {
  BluebirdPanel,
  ChartPanel,
  WarningsPanel,
} from "@/components/CustomChartPanels";

type CustomChartClientProps = {
  data: ForecastPoint[];
  timeZone: TimeZoneId;
};

export default function CustomChartClient({
  data,
  timeZone,
}: CustomChartClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const formatters = createTimeFormatters(timeZone);
  const chartData = buildChartData(data, formatters);
  const warningDetails = buildWarningDetails(buildWarnings(chartData), chartData);
  const bluebirdWindows = buildBluebirdWindows(chartData);
  const xAxisTicks = buildXAxisTicks(chartData);
  const { chartHeight, chartMargin } = buildChartLayout(isMobile);
  const resolvedIndex =
    activeIndex != null && chartData[activeIndex] ? activeIndex : null;
  const activePoint =
    resolvedIndex != null ? chartData[resolvedIndex] : null;

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <WarningsPanel warnings={warningDetails} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BluebirdPanel windows={bluebirdWindows} />
        </Grid>
      </Grid>

      <ChartPanel
        chartData={chartData}
        xAxisTicks={xAxisTicks}
        dayFormatter={formatters.dayFormatter}
        isMobile={isMobile}
        chartHeight={chartHeight}
        chartMargin={chartMargin}
        legendItems={legendItems}
        lineSeries={lineSeries}
        activePoint={activePoint}
        onSelectPoint={isMobile ? setActiveIndex : undefined}
      />
    </Stack>
  );
}
