import type { ChartPoint } from "@/components/chart/customChartData";

export type ChartInteractionPayload = {
  activeTooltipIndex?: number;
  activeLabel?: string;
  activePayload?: Array<{ payload?: ChartPoint }>;
} | null;

export const resolveChartIndex = (payload: ChartInteractionPayload, chartData: ChartPoint[]) => {
  if (!payload) return null;
  if (typeof payload.activeTooltipIndex === "number") return payload.activeTooltipIndex;
  if (payload.activeLabel) {
    const labelIndex = chartData.findIndex((point) => point.time === payload.activeLabel);
    if (labelIndex >= 0) return labelIndex;
  }
  const payloadPoint = payload.activePayload?.[0]?.payload;
  if (!payloadPoint) return null;
  const matchIndex = chartData.findIndex(
    (point) => point.time === payloadPoint.time && point.startTime === payloadPoint.startTime,
  );
  return matchIndex >= 0 ? matchIndex : null;
};
