import { alpha, createTheme } from "@mui/material/styles";

const primaryBlue = "rgba(93, 162, 255, 1)";
const emerald = "rgba(52, 211, 153, 1)";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: primaryBlue },
    secondary: { main: emerald },
    background: {
      default: "rgba(7, 15, 31, 1)",
      paper: "rgba(255,255,255,0.04)",
    },
    divider: "rgba(255,255,255,0.08)",
    text: {
      primary: "rgba(229, 237, 255, 1)",
      secondary: "rgba(198, 212, 245, 1)",
    },
  },
  typography: {
    fontFamily: 'var(--font-body, "Inter", "Helvetica Neue", Arial, sans-serif)',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: alpha("rgba(255, 255, 255, 1)", 0.08),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
