import type { ReactNode } from "react";
import { CloudRain, Droplets, Snowflake } from "lucide-react";
import type { ChartPoint } from "@/components/chart/customChartData";
import { chartColors } from "@/data/chartStyles";

export type MetricItem = {
  key: string;
  label: string;
  value: ReactNode;
  color: string;
  icon: ReactNode;
};

export const buildPrecipMetrics = (point: ChartPoint | null, placeholder: string): MetricItem[] => {
  const metrics: MetricItem[] = [];
  const isRain = point?.precipitationType === "rain";
  const snowAmount = point?.inches ?? 0;
  const rainAmount = point?.precipInches ?? 0;
  const hasSnow = snowAmount > 0;
  const hasRain = rainAmount > 0;
  const hasAmount = isRain ? hasRain : hasSnow;
  const amountValue = isRain ? rainAmount : snowAmount;
  const amountLabel = isRain ? "Rain" : "Snow";
  const amountColor = isRain ? chartColors.rain : chartColors.snowHighChance;
  const amountIcon = isRain ? (
    <CloudRain size={18} color={amountColor} strokeWidth={2.25} />
  ) : (
    <Snowflake size={18} color={amountColor} strokeWidth={2.25} />
  );

  metrics.push({
    key: "precip",
    label: amountLabel,
    value: point ? (hasAmount ? `${amountValue}"` : '0"') : placeholder,
    color: amountColor,
    icon: amountIcon,
  });

  const snowChanceValue = !point
    ? placeholder
    : point.precipitationType === "snow"
      ? `${point.precipProbability ?? 0}%`
      : point.precipitationType === "none"
        ? "0%"
        : placeholder;
  const rainChanceValue = !point
    ? placeholder
    : point.precipitationType === "rain"
      ? `${point.precipProbability ?? 0}%`
      : point.precipitationType === "none"
        ? "0%"
        : placeholder;

  metrics.push({
    key: "snow-chance",
    label: "Snow chance",
    value: snowChanceValue,
    color: chartColors.snowHighChance,
    icon: <Snowflake size={18} color={chartColors.snowHighChance} strokeWidth={2.25} />,
  });

  metrics.push({
    key: "rain-chance",
    label: "Rain chance",
    value: rainChanceValue,
    color: chartColors.rain,
    icon: <Droplets size={18} color={chartColors.rain} strokeWidth={2.25} />,
  });

  return metrics;
};
