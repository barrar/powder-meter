"use client";

import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Cloud, CloudRain, Thermometer, Wind } from "lucide-react";
import { Bar, Cell, ComposedChart, LabelList, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { resolveChartIndex, type ChartInteractionPayload } from "@/components/chart/chartInteraction";
import { buildPrecipMetrics } from "@/components/chart/legendMetrics";
import { renderSnowLabel, resolveSnowBarColor } from "@/components/chart/snowChartPresentation";
import type { BluebirdWindow, ChartMargin, ChartPoint, LineSeries, WarningDetail } from "@/components/chart/customChartData";
import { chartColors, surfaceGradient } from "@/data/chartStyles";

const panelSx = {
  p: { xs: 2, md: 3 },
  background: surfaceGradient,
  boxShadow: "0 18px 48px rgba(6, 12, 28, 0.4)",
};

const chartPanelSx = {
  p: { xs: 2, md: 3 },
  background: surfaceGradient,
  boxShadow: "0 24px 60px rgba(6, 12, 28, 0.45)",
};

type ForecastLegendProps = {
  point: ChartPoint | null;
};

const ForecastLegend = ({ point }: ForecastLegendProps) => {
  const placeholder = "-";
  const titleText = point ? point.rangeLabel : "Select a chart area to view details.";
  const precipMetrics = buildPrecipMetrics(point, placeholder);

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>
          {titleText}
        </Typography>
      </Stack>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: 1,
          textAlign: "center",
        }}
      >
        {[
          ...precipMetrics,
          {
            key: "temp",
            label: "Temperature",
            value: point && point.temperatureF != null ? `${Math.round(point.temperatureF)}°F` : placeholder,
            color: chartColors.temperature,
            icon: <Thermometer size={18} color={chartColors.temperature} strokeWidth={2.25} />,
          },
          {
            key: "wind",
            label: "Wind",
            value: point && point.windMph != null ? `${point.windMph} mph` : placeholder,
            color: chartColors.wind,
            icon: <Wind size={18} color={chartColors.wind} strokeWidth={2.25} />,
          },
          {
            key: "cloud",
            label: "Cloud cover",
            value: point && point.cloudCover != null ? `${point.cloudCover}%` : placeholder,
            color: chartColors.cloud,
            icon: <Cloud size={18} color={chartColors.cloud} strokeWidth={2.25} />,
          },
        ].map((metric) => (
          <Stack key={metric.key} alignItems="center" sx={{ flex: "0 1 100px" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {metric.icon}
            </Box>
            <Typography variant="caption" color={metric.color} fontWeight={700}>
              {metric.label}
            </Typography>
            <Typography variant="subtitle1" color={metric.color} fontWeight={700}>
              {metric.value}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Stack>
  );
};

type WarningsPanelProps = {
  warnings: WarningDetail[];
};

export const WarningsPanel = ({ warnings }: WarningsPanelProps) => (
  <Paper elevation={0} sx={panelSx}>
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
        Warnings
      </Typography>
      {warnings.length ? (
        <Stack spacing={1}>
          {warnings.map((warning) => (
            <Stack key={warning.id} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  mt: 0.35,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {warning.alert === "rain" ? (
                  <CloudRain size={32} color={chartColors.rain} strokeWidth={2.25} />
                ) : (
                  <Wind size={32} color={chartColors.wind} strokeWidth={2.25} />
                )}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {warning.rangeLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {warning.summaryText}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No active warnings.
        </Typography>
      )}
    </Stack>
  </Paper>
);

type BluebirdPanelProps = {
  windows: BluebirdWindow[];
};

export const BluebirdPanel = ({ windows }: BluebirdPanelProps) => (
  <Paper elevation={0} sx={panelSx}>
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
        Bluebird windows
      </Typography>
      {windows.length ? (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {windows.map((window) => (
            <Chip
              key={window.key}
              label={window.label}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ color: "rgba(219, 234, 254, 1)" }}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No bluebird windows in this range yet.
        </Typography>
      )}
    </Stack>
  </Paper>
);

type ChartSurfaceProps = {
  chartData: ChartPoint[];
  xAxisTicks: string[];
  dayFormatter: Intl.DateTimeFormat;
  isMobile: boolean;
  chartHeight: number;
  chartMargin: ChartMargin;
  lineSeries: LineSeries[];
  onSelectPoint: (index: number) => void;
};

const ChartSurface = ({
  chartData,
  xAxisTicks,
  dayFormatter,
  isMobile,
  chartHeight,
  chartMargin,
  lineSeries,
  onSelectPoint,
}: ChartSurfaceProps) => (
  <Box
    sx={{
      width: "100%",
      overflowX: isMobile ? "auto" : "visible",
      WebkitOverflowScrolling: "touch",
    }}
  >
    <Box
      sx={{
        position: "relative",
        height: chartHeight,
        minHeight: chartHeight,
        width: "100%",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        "& .recharts-wrapper": {
          outline: "none",
        },
        "& .recharts-surface": {
          outline: "none",
        },
        "& .recharts-surface *": {
          outline: "none",
        },
        "& .recharts-layer": {
          outline: "none",
        },
        "& .recharts-rectangle": {
          outline: "none",
        },
        "& .recharts-bar-rectangle": {
          outline: "none",
        },
        "& .recharts-dot": {
          outline: "none",
        },
        "& .recharts-active-dot": {
          outline: "none",
        },
        "& .recharts-line-dot": {
          outline: "none",
        },
      }}
    >
      <ResponsiveContainer width="100%" height={chartHeight} minHeight={chartHeight} minWidth={750}>
        <ComposedChart
          data={chartData}
          margin={chartMargin}
          barGap={-16}
          barCategoryGap="30%"
          onMouseMove={(event) => {
            const index = resolveChartIndex(event as ChartInteractionPayload, chartData);
            if (index != null) onSelectPoint(index);
          }}
          onClick={(event) => {
            if (!onSelectPoint) return;
            const index = resolveChartIndex(event as ChartInteractionPayload, chartData);
            if (index != null) onSelectPoint(index);
          }}
        >
          <XAxis
            dataKey="time"
            ticks={xAxisTicks}
            tickFormatter={(value) => dayFormatter.format(new Date(String(value)))}
            tick={{
              fill: "rgba(215, 227, 255, 1)",
              fontSize: isMobile ? 10 : 12,
              fontWeight: 600,
            }}
            tickMargin={isMobile ? 8 : 12}
            axisLine={{ stroke: "rgba(203, 213, 245, 0.35)" }}
            tickLine={{ stroke: "rgba(203, 213, 245, 0.35)" }}
          />
          <YAxis yAxisId="snow" hide domain={[0, "auto"]} padding={{ top: 20 }} />
          <YAxis yAxisId="weather" hide domain={[0, 100]} />
          <Bar
            yAxisId="weather"
            dataKey="precipProbabilityChart"
            name="Precip chance (%)"
            fill={chartColors.rain}
            barSize={22}
          >
            {chartData.map((point) => (
              <Cell key={`rain-${point.time}`} fill={chartColors.rain} />
            ))}
          </Bar>
          {lineSeries.map((series) => (
            <Line
              key={series.id}
              yAxisId="weather"
              type="linear"
              dataKey={series.dataKey}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Bar yAxisId="snow" dataKey="snowChart" name="Snow (in)" fill={chartColors.snow} barSize={22}>
            {chartData.map((point) => (
              <Cell key={point.time} fill={resolveSnowBarColor(point)} />
            ))}
            <LabelList dataKey="snowChart" content={renderSnowLabel} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  </Box>
);

type ChartPanelProps = {
  chartData: ChartPoint[];
  xAxisTicks: string[];
  dayFormatter: Intl.DateTimeFormat;
  isMobile: boolean;
  chartHeight: number;
  chartMargin: ChartMargin;
  lineSeries: LineSeries[];
  activePoint: ChartPoint | null;
  onSelectPoint: (index: number) => void;
};

export const ChartPanel = ({
  chartData,
  xAxisTicks,
  dayFormatter,
  isMobile,
  chartHeight,
  chartMargin,
  lineSeries,
  activePoint,
  onSelectPoint,
}: ChartPanelProps) => (
  <Paper elevation={0} sx={chartPanelSx}>
    <Stack direction="column" justifyContent="space-between" alignItems="center" spacing={2}>
      <Box sx={{ flex: 1, width: "100%" }}>
        <ForecastLegend point={activePoint} />
      </Box>
    </Stack>

    <ChartSurface
      chartData={chartData}
      xAxisTicks={xAxisTicks}
      dayFormatter={dayFormatter}
      isMobile={isMobile}
      chartHeight={chartHeight}
      chartMargin={chartMargin}
      lineSeries={lineSeries}
      onSelectPoint={onSelectPoint}
    />
  </Paper>
);
