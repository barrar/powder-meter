import type { LabelProps } from "recharts";
import type { ChartPoint } from "@/components/chart/customChartData";
import { chartColors } from "@/data/chartStyles";

export const renderSnowLabel = ({ x, y, width, value }: LabelProps) => {
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
        fill="rgba(18, 31, 62, 1)"
        stroke="rgba(255, 255, 255, .2)"
        strokeWidth={1}
      />
      <text
        x={x + width / 2}
        y={rectY + rectHeight / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(229, 237, 255, 1)"
        fontSize={12}
        fontWeight={700}
      >
        {labelText}
      </text>
    </g>
  );
};

export const resolveSnowBarColor = (point: ChartPoint) => {
  const chance = point.precipProbability;
  if (chance != null && Number.isFinite(chance)) {
    if (chance >= 70) return chartColors.snowHighChance;
    if (chance >= 40) return chartColors.snow;
  }
  return chartColors.snowLowChance;
};
