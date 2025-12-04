import { alpha, createTheme } from '@mui/material/styles'

const primaryBlue = '#5da2ff'
const emerald = '#34d399'

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: primaryBlue },
        secondary: { main: emerald },
        background: {
            default: '#070f1f',
            paper: 'rgba(255,255,255,0.04)',
        },
        divider: 'rgba(255,255,255,0.08)',
        text: {
            primary: '#e5edff',
            secondary: '#c6d4f5',
        },
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: 'var(--font-body, "Inter", "Helvetica Neue", Arial, sans-serif)',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderColor: alpha('#ffffff', 0.08),
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
})

export default theme
