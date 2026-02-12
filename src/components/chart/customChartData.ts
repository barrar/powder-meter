import { chartColors } from "@/data/chartStyles";
import type { ForecastPoint } from "@/data/weather/forecastTypes";
import type { TimeZoneId } from "@/data/timeZones";

const rainWarningThreshold = 10;
const rainPrecipThreshold = 0.02;
const windWarningThreshold = 20;
const maxWarningRangeMs = 24 * 60 * 60 * 1000;

export type ChartPoint = ForecastPoint & {
  peakWindMph: number | null;
  timeLabel: string;
  dateLabel: string;
  rangeLabel: string;
  dayLabel: string;
  endTimeLabel: string;
  endTimeMs: number;
  snowChart: number;
  precipProbabilityChart: number | null;
  showRainRisk: boolean;
  showWindRisk: boolean;
};

export type WarningType = "rain" | "wind";

export type WarningRange = {
  alert: WarningType;
  startIndex: number;
  endIndex: number;
  startLabel: string;
  endLabel: string;
  startDateLabel: string;
  startTimeMs: number;
  endTimeMs: number;
};

export type WarningDetail = {
  id: string;
  alert: WarningType;
  rangeLabel: string;
  summaryText: string;
};

export type BluebirdWindow = {
  key: string;
  label: string;
};

export type LegendItem = {
  id: string;
  label: string;
  color: string;
};

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ChartLayout = {
  chartHeight: number;
  chartMargin: ChartMargin;
};

export type TimeFormatters = {
  dayFormatter: Intl.DateTimeFormat;
  dateFormatter: Intl.DateTimeFormat;
  hourFormatter: Intl.DateTimeFormat;
};

export type LineSeries = {
  id: string;
  dataKey: keyof ChartPoint;
  label: string;
  color: string;
};

export const lineSeries: LineSeries[] = [
  {
    id: "temperature",
    dataKey: "temperatureF",
    label: "Temp (\u00b0F)",
    color: chartColors.temperature,
  },
  {
    id: "wind",
    dataKey: "windMph",
    label: "Wind (mph)",
    color: chartColors.wind,
  },
  {
    id: "cloud",
    dataKey: "cloudCover",
    label: "Cloud cover (%)",
    color: chartColors.cloud,
  },
];

export const legendItems: LegendItem[] = [
  { id: "snowfall", label: "Snow (in)", color: chartColors.snow },
  ...lineSeries.map(({ id, label, color }) => ({ id, label, color })),
];

const formatMph = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return "-";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} mph`;
};

const formatPercent = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${Math.round(value)}%`;
};

const formatInches = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return "-";
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}"`;
};

const normalizeTimeLabel = (value: string) => value.replace(/\s/g, "").toLowerCase();

export const createTimeFormatters = (timeZone: TimeZoneId): TimeFormatters => ({
  dayFormatter: new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }),
  dateFormatter: new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone,
  }),
  hourFormatter: new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone,
  }),
});

const resolveNextTimeMs = (data: ForecastPoint[], index: number, currentTimeMs: number) => {
  const nextPoint = data[index + 1];
  if (nextPoint) return new Date(nextPoint.time).getTime();
  if (index > 0) {
    const prevTimeMs = new Date(data[index - 1].time).getTime();
    return currentTimeMs + (currentTimeMs - prevTimeMs);
  }
  return null;
};

const buildTimeLabels = (currentDate: Date, nextDate: Date | null, formatters: TimeFormatters) => {
  const timeOnlyLabel = normalizeTimeLabel(formatters.hourFormatter.format(currentDate));
  const dateLabel = formatters.dateFormatter.format(currentDate);
  const timeLabel = `${dateLabel}, ${timeOnlyLabel}`;
  const endTimeLabel = nextDate
    ? `${formatters.dateFormatter.format(nextDate)}, ${normalizeTimeLabel(formatters.hourFormatter.format(nextDate))}`
    : timeLabel;
  const rangeLabel = nextDate
    ? `${timeLabel} - ${normalizeTimeLabel(formatters.hourFormatter.format(nextDate))}`
    : timeLabel;
  const dayLabel = formatters.dayFormatter.format(currentDate);

  return { timeLabel, dateLabel, rangeLabel, dayLabel, endTimeLabel };
};

export const buildChartData = (data: ForecastPoint[], formatters: TimeFormatters): ChartPoint[] =>
  data.map((point, idx) => {
    const currentDate = new Date(point.time);
    const currentTimeMs = currentDate.getTime();
    const nextTimeMs = resolveNextTimeMs(data, idx, currentTimeMs);
    const nextDate = nextTimeMs ? new Date(nextTimeMs) : null;
    const { timeLabel, dateLabel, rangeLabel, dayLabel, endTimeLabel } = buildTimeLabels(
      currentDate,
      nextDate,
      formatters,
    );

    const isRain = point.precipitationType === "rain";
    const probabilityValue = point.precipProbability ?? null;
    const rainAmount = point.precipInches ?? 0;
    const rainChance = probabilityValue ?? 0;
    const suppressRain = isRain && (rainChance < 20 || rainAmount <= 0.02);
    const adjustedPrecipInches = suppressRain ? 0 : rainAmount;
    const adjustedProbability = suppressRain ? 0 : probabilityValue;
    const adjustedPrecipType = suppressRain ? "none" : point.precipitationType;
    const hasMeaningfulPrecip = adjustedPrecipInches > rainPrecipThreshold;
    const hasRainProbability =
      adjustedProbability == null ? rainWarningThreshold <= 0 : adjustedProbability >= rainWarningThreshold;
    const showRainRisk = isRain && hasMeaningfulPrecip && hasRainProbability;
    const chartProbability = showRainRisk ? adjustedProbability : null;
    const peakWindMph = point.windGustMph ?? point.windMph;
    const showWindRisk = peakWindMph != null && peakWindMph > windWarningThreshold;

    return {
      ...point,
      peakWindMph,
      timeLabel,
      dateLabel,
      rangeLabel,
      dayLabel,
      endTimeLabel,
      endTimeMs: nextTimeMs ?? currentTimeMs,
      snowChart: point.inches ?? 0,
      precipInches: adjustedPrecipInches || null,
      precipProbability: adjustedProbability,
      precipProbabilityChart: chartProbability,
      precipitationType: adjustedPrecipType,
      showRainRisk,
      showWindRisk,
    };
  });

const isRainWarningPoint = (point: ChartPoint) => point.showRainRisk || point.alert === "rain";
const isWindWarningPoint = (point: ChartPoint) => point.showWindRisk;

const buildWarningSegments = (
  chartData: ChartPoint[],
  alert: WarningType,
  shouldInclude: (point: ChartPoint) => boolean,
) => {
  const segments: WarningRange[] = [];
  let current: WarningRange | null = null;

  chartData.forEach((point, idx) => {
    if (!shouldInclude(point)) {
      current = null;
      return;
    }
    const pointTimeMs = new Date(point.time).getTime();
    if (!current) {
      current = {
        alert,
        startIndex: idx,
        endIndex: idx,
        startLabel: point.timeLabel,
        endLabel: point.endTimeLabel,
        startDateLabel: point.dateLabel,
        startTimeMs: pointTimeMs,
        endTimeMs: point.endTimeMs,
      };
      segments.push(current);
      return;
    }
    const exceedsWindow = point.endTimeMs - current.startTimeMs > maxWarningRangeMs;
    if (exceedsWindow) {
      current = {
        alert,
        startIndex: idx,
        endIndex: idx,
        startLabel: point.timeLabel,
        endLabel: point.endTimeLabel,
        startDateLabel: point.dateLabel,
        startTimeMs: pointTimeMs,
        endTimeMs: point.endTimeMs,
      };
      segments.push(current);
      return;
    }
    current.endIndex = idx;
    current.endLabel = point.endTimeLabel;
    current.endTimeMs = point.endTimeMs;
  });

  return segments;
};

const mergeWarningSegments = (segments: WarningRange[]) => {
  const merged: WarningRange[] = [];
  segments.forEach((segment) => {
    const current = merged[merged.length - 1];
    if (!current) {
      merged.push({ ...segment });
      return;
    }
    const withinWindow = segment.endTimeMs - current.startTimeMs <= maxWarningRangeMs;
    if (withinWindow) {
      current.endIndex = segment.endIndex;
      current.endLabel = segment.endLabel;
      current.endTimeMs = segment.endTimeMs;
      return;
    }
    merged.push({ ...segment });
  });
  return merged;
};

export const buildWarnings = (chartData: ChartPoint[]) => {
  const rainSegments = mergeWarningSegments(buildWarningSegments(chartData, "rain", isRainWarningPoint));
  const windSegments = mergeWarningSegments(buildWarningSegments(chartData, "wind", isWindWarningPoint));
  return [...rainSegments, ...windSegments].sort((a, b) => a.startIndex - b.startIndex);
};

type RainSummary = {
  averageChance: number | null;
  totalPrecip: number;
};

type WindSummary = {
  averageWind: number | null;
  peakWind: number | null;
};

const getRainSummary = (warning: WarningRange, chartData: ChartPoint[]): RainSummary | null => {
  if (warning.alert !== "rain") return null;
  const warningPoints = chartData.slice(warning.startIndex, warning.endIndex + 1).filter(isRainWarningPoint);
  if (!warningPoints.length) return null;
  const chanceValues = warningPoints
    .map((point) => point.precipProbability)
    .filter((value): value is number => value != null);
  const averageChance = chanceValues.length
    ? chanceValues.reduce((sum, value) => sum + value, 0) / chanceValues.length
    : null;
  const totalPrecip = warningPoints.reduce((total, point) => total + (point.precipInches ?? 0), 0);
  return { averageChance, totalPrecip };
};

const getWindSummary = (warning: WarningRange, chartData: ChartPoint[]): WindSummary | null => {
  if (warning.alert !== "wind") return null;
  const warningPoints = chartData.slice(warning.startIndex, warning.endIndex + 1).filter(isWindWarningPoint);
  if (!warningPoints.length) return null;
  const windValues = warningPoints.map((point) => point.windMph).filter((value): value is number => value != null);
  const averageWind = windValues.length ? windValues.reduce((sum, value) => sum + value, 0) / windValues.length : null;
  const gustValues = warningPoints.map((point) => point.windGustMph).filter((value): value is number => value != null);
  const peakWind = gustValues.length ? Math.max(...gustValues) : null;
  return { averageWind, peakWind };
};

const buildWarningDetail = (warning: WarningRange, rangeLabel: string, summaryText: string): WarningDetail => ({
  id: `${warning.alert}-${warning.startIndex}-${warning.endIndex}`,
  alert: warning.alert,
  rangeLabel,
  summaryText,
});

export const buildWarningDetails = (warnings: WarningRange[], chartData: ChartPoint[]): WarningDetail[] =>
  warnings.flatMap((warning) => {
    const rangeLabel = `${warning.startLabel} - ${warning.endLabel}`;
    if (warning.alert === "rain") {
      const summary = getRainSummary(warning, chartData);
      if (!summary || summary.totalPrecip < 0.04) return [];
      const summaryText = `Average rain chance ${formatPercent(summary.averageChance)}, total rain ${formatInches(summary.totalPrecip)}`;
      return [buildWarningDetail(warning, rangeLabel, summaryText)];
    }
    const summary = getWindSummary(warning, chartData);
    const summaryText = summary
      ? `Average ${formatMph(summary.averageWind)}, peak ${summary.peakWind != null ? formatMph(summary.peakWind) : "unavailable"}`
      : "";
    return [buildWarningDetail(warning, rangeLabel, summaryText)];
  });

export const buildBluebirdWindows = (chartData: ChartPoint[]): BluebirdWindow[] =>
  chartData.filter((point) => point.isBluebird).map((point) => ({ key: point.startTime, label: point.timeLabel }));

export const buildXAxisTicks = (chartData: ChartPoint[]) =>
  chartData
    .reduce<string[]>((acc, point, idx) => {
      const previous = chartData[idx - 1];
      if (!previous || previous.dayLabel !== point.dayLabel) {
        acc.push(point.time);
      }
      return acc;
    }, [])
    .slice(1);

export const buildChartLayout = (isMobile: boolean): ChartLayout => {
  const chartHeight = isMobile ? 360 : 520;
  const chartMargin = {
    top: isMobile ? 10 : 15,
    right: isMobile ? 0 : 10,
    bottom: isMobile ? 0 : 10,
    left: isMobile ? 0 : 10,
  };

  return { chartHeight, chartMargin };
};
