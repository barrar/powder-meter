"use client";

import type { BluebirdWindow, ChartMargin, ChartPoint, LegendItem, LineSeries, WarningDetail } from "@/components/customChartData";
import { chartColors, surfaceGradient, tooltipGradient } from "@/data/chartStyles";
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Cloud, CloudRain, Droplets, Snowflake, Thermometer, Wind } from "lucide-react";
import type { ReactNode } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from "recharts";

const panelSx = {
  p: 3,
  background: surfaceGradient,
  boxShadow: "0 18px 48px rgba(6, 12, 28, 0.4)",
};

const chartPanelSx = {
  p: { xs: 2.5, md: 3.5 },
  background: surfaceGradient,
  boxShadow: "0 24px 60px rgba(6, 12, 28, 0.45)",
};

const renderSnowLabel = ({ x, y, width, value }: LabelProps) => {
  if (value == null) return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) return null;
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") return null;

  const labelText = String(numeric);
  const rectHeight = 18;
  const rectPadding = 8;
  const rectWidth = labelText.length * 7 + rectPadding;
  const rectX = x + width / 2 - rectWidth / 2;
  const rectY = y - rectHeight - 4;

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        rx={6}
        ry={6}
        fill="rgb(18, 31, 62)"
        stroke="rgba(255, 255, 255, .2)"
        strokeWidth={1}
      />
      <text
        x={x + width / 2}
        y={rectY + rectHeight / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e5edff"
        fontSize={12}
        fontWeight={700}
      >
        {labelText}
      </text>
    </g>
  );
};

type MetricRowProps = {
  label: string;
  value: ReactNode;
  color: string;
  icon?: ReactNode;
};

const MetricRow = ({ label, value, color, icon }: MetricRowProps) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon ? (
        <Box
          sx={{
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: "0 0 8px rgba(15, 23, 42, 0.45)",
          }}
        />
      )}
      <Typography variant="subtitle1" color={color} fontWeight={700}>
        {label}
      </Typography>
    </Stack>
    <Typography variant="subtitle1" color={color} fontWeight={700}>
      {value}
    </Typography>
  </Stack>
);

type MobileLegendProps = {
  point: ChartPoint | null;
};

const MobileLegend = ({ point }: MobileLegendProps) => {
  const placeholder = "-";
  const titleText = point ? point.rangeLabel : "Select an area of the chart to view details.";

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
          {
            key: "snow",
            label: "Snow",
            value: point ? `${point.inches ?? 0}"` : placeholder,
            color: chartColors.snow,
            icon: <Snowflake size={18} color={chartColors.snow} strokeWidth={2.25} />,
          },
          {
            key: "precip",
            label: "Precipitation",
            value: point ? `${point.precipInches ?? 0}"` : placeholder,
            color: chartColors.precipProbability,
            icon: <CloudRain size={18} color={chartColors.precipProbability} strokeWidth={2.25} />,
          },
          {
            key: "chance",
            label: "Rain chance",
            value: point ? `${point.precipProbability ?? 0}%` : placeholder,
            color: chartColors.precipProbability,
            icon: <Droplets size={18} color={chartColors.precipProbability} strokeWidth={2.25} />,
          },
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

type ForecastTooltipProps = TooltipContentProps<number, string> & {
  points: ChartPoint[];
};

const ForecastTooltip = ({ active, payload, activeIndex, points }: ForecastTooltipProps) => {
  if (!active) return null;
  const payloadPoint = payload?.[0]?.payload as ChartPoint | undefined;
  const fallbackPoint = typeof activeIndex === "number" ? points[activeIndex] : undefined;
  const point = payloadPoint ?? fallbackPoint;
  if (!point) return null;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        minWidth: 220,
        backdropFilter: "blur(14px)",
        background: tooltipGradient,
        boxShadow: "0 22px 60px rgba(4, 6, 18, 0.55)",
        "& .MuiTypography-root": {
          fontWeight: 700,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {point.rangeLabel}
          </Typography>
        </Stack>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
        <Stack spacing={0.75}>
          <MetricRow
            label="Snow"
            value={`${point.inches ?? 0}"`}
            color={chartColors.snow}
            icon={<Snowflake size={18} color={chartColors.snow} strokeWidth={2.25} />}
          />
          <MetricRow
            label="Precipitation"
            value={`${point.precipInches ?? 0}"`}
            color={chartColors.precipProbability}
            icon={<CloudRain size={18} color={chartColors.precipProbability} strokeWidth={2.25} />}
          />
          <MetricRow
            label="Rain chance"
            value={`${point.precipProbability ?? 0}%`}
            color={chartColors.precipProbability}
            icon={<Droplets size={18} color={chartColors.precipProbability} strokeWidth={2.25} />}
          />
          {point.temperatureF != null && (
            <MetricRow
              label="Temperature"
              value={`${Math.round(point.temperatureF)}\u00b0F`}
              color={chartColors.temperature}
              icon={<Thermometer size={18} color={chartColors.temperature} strokeWidth={2.25} />}
            />
          )}
          {point.windMph != null && (
            <MetricRow
              label="Wind"
              value={`${point.windMph} mph`}
              color={chartColors.wind}
              icon={<Wind size={18} color={chartColors.wind} strokeWidth={2.25} />}
            />
          )}
          {point.cloudCover != null && (
            <MetricRow
              label="Cloud cover"
              value={`${point.cloudCover}%`}
              color={chartColors.cloud}
              icon={<Cloud size={18} color={chartColors.cloud} strokeWidth={2.25} />}
            />
          )}
        </Stack>
      </Stack>
    </Paper>
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
                  <CloudRain size={32} color={chartColors.precipProbability} strokeWidth={2.25} />
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
            <Chip key={window.key} label={window.label} color="primary" variant="outlined" size="small" sx={{ color: "#dbeafe" }} />
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

type ChartLegendProps = {
  items: LegendItem[];
};

const ChartLegend = ({ items }: ChartLegendProps) => (
  <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center" alignItems="center" sx={{ width: { xs: "100%", md: "auto" } }}>
    {items.map((series) => (
      <Stack key={series.id} direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ width: 10, height: 10, backgroundColor: series.color }} />
        <Typography variant="body2" fontWeight={700}>
          {series.label}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

type ChartSurfaceProps = {
  chartData: ChartPoint[];
  xAxisTicks: string[];
  dayFormatter: Intl.DateTimeFormat;
  isMobile: boolean;
  chartHeight: number;
  chartMargin: ChartMargin;
  lineSeries: LineSeries[];
  onSelectPoint?: (index: number) => void;
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
          onClick={(event) => {
            if (!onSelectPoint) return;
            const payload = event as {
              activeTooltipIndex?: number;
              activeLabel?: string;
              activePayload?: Array<{ payload?: ChartPoint }>;
            } | null;
            const index = payload && typeof payload.activeTooltipIndex === "number" ? payload.activeTooltipIndex : null;
            if (index != null) {
              onSelectPoint(index);
              return;
            }
            if (payload?.activeLabel) {
              const labelIndex = chartData.findIndex((point) => point.time === payload.activeLabel);
              if (labelIndex >= 0) {
                onSelectPoint(labelIndex);
                return;
              }
            }
            const payloadPoint = payload?.activePayload?.[0]?.payload;
            if (!payloadPoint) return;
            const matchIndex = chartData.findIndex(
              (point) => point.time === payloadPoint.time && point.startTime === payloadPoint.startTime,
            );
            if (matchIndex >= 0) onSelectPoint(matchIndex);
          }}
        >
          <CartesianGrid vertical={false} stroke="rgba(203, 213, 245, 0.18)" strokeDasharray="4 6" />
          <XAxis
            dataKey="time"
            ticks={xAxisTicks}
            tickFormatter={(value) => dayFormatter.format(new Date(String(value)))}
            tick={{
              fill: "#d7e3ff",
              fontSize: isMobile ? 10 : 12,
              fontWeight: 600,
            }}
            tickMargin={isMobile ? 8 : 12}
            axisLine={{ stroke: "rgba(203, 213, 245, 0.35)" }}
            tickLine={{ stroke: "rgba(203, 213, 245, 0.35)" }}
          />
          <YAxis yAxisId="snow" hide domain={[0, "auto"]} padding={{ top: 20 }} />
          <YAxis yAxisId="weather" hide domain={[0, 100]} />
          {!isMobile && (
            <Tooltip<number, string>
              content={(props) => <ForecastTooltip {...props} points={chartData} />}
              cursor={{ stroke: "rgba(219, 231, 255, 0.25)" }}
              filterNull={false}
              shared
              wrapperStyle={{ outline: "none" }}
            />
          )}
          <Bar
            yAxisId="weather"
            dataKey="precipProbabilityChart"
            name="Rain chance (%)"
            fill={chartColors.precipProbability}
            barSize={10}
          />
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
          <Bar yAxisId="snow" dataKey="inches" name="Snow (in)" fill={chartColors.snow} barSize={22}>
            <LabelList dataKey="inches" content={renderSnowLabel} />
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
  legendItems: LegendItem[];
  lineSeries: LineSeries[];
  activePoint: ChartPoint | null;
  onSelectPoint?: (index: number) => void;
};

export const ChartPanel = ({
  chartData,
  xAxisTicks,
  dayFormatter,
  isMobile,
  chartHeight,
  chartMargin,
  legendItems,
  lineSeries,
  activePoint,
  onSelectPoint,
}: ChartPanelProps) => (
  <Paper elevation={0} sx={chartPanelSx}>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
      {isMobile ? <MobileLegend point={activePoint} /> : <ChartLegend items={legendItems} />}
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
