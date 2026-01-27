import { alpha } from "@mui/material/styles";

export const chartColors = {
  snow: "#cadeed",
  temperature: "#ffd37a",
  wind: "#6ee7b7",
  cloud: "#d0a6ff",
  precipProbability: "#7fb7ff",
  alertDefault: "#c7d2fe",
};

export const surfaceGradient = `linear-gradient(160deg, ${alpha("#7fb7ff", 0.25)}, ${alpha("#7fb7ff", 0.1)})`;
export const tooltipGradient = `linear-gradient(140deg, ${alpha("#7fb7ff", 0.22)}, rgba(8, 14, 28, 0.96))`;
