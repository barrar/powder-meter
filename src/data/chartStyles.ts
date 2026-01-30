import { alpha } from "@mui/material/styles";

export const chartColors = {
  snow: "rgba(255, 255, 255, 0.7)",
  snowLowChance: "rgba(255, 255, 255, 0.3)",
  snowHighChance: "rgb(255, 255, 255)",
  rain: "rgba(248, 113, 113, 1)",
  temperature: "rgba(255, 211, 122, 1)",
  wind: "rgba(110, 231, 183, 1)",
  cloud: "rgba(208, 166, 255, 1)",
  precipProbability: "rgba(127, 183, 255, 1)",
  alertDefault: "rgba(199, 210, 254, 1)",
};

export const surfaceGradient = `linear-gradient(160deg, ${alpha(chartColors.precipProbability, 0.25)}, ${alpha(
  chartColors.precipProbability,
  0.1,
)})`;
export const tooltipGradient = `linear-gradient(140deg, ${alpha(chartColors.precipProbability, 0.22)}, rgba(8, 14, 28, 0.96))`;
