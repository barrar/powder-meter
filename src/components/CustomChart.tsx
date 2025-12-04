'use client'

import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import {
    ChartsTooltipContainer,
    type ChartsTooltipProps,
    useItemTooltip,
} from '@mui/x-charts/ChartsTooltip'
import type { ForecastPoint } from '../data/getWeatherData'

const barColor = (point: ForecastPoint) => {
    if (point.alert === 'rain') return '#f44336'
    if (point.alert === 'light-precip') return '#f59e0b'
    if (point.isBluebird) return '#60a5fa'
    return '#5da2ff'
}

const warningTone = (point: ForecastPoint) => {
    if (point.alert === 'rain') return { label: 'Rain risk', color: 'error' as const }
    if (point.alert === 'light-precip') return { label: 'Light precip', color: 'warning' as const }
    if (point.alert === 'snow-ongoing') return { label: 'Snow ongoing', color: 'secondary' as const }
    if (point.isBluebird) return { label: 'Bluebird', color: 'info' as const }
    return null
}

type TooltipProps = ChartsTooltipProps<'item'> & { points: ForecastPoint[] }

const ForecastTooltip = ({ points, ...props }: TooltipProps) => {
    const tooltip = useItemTooltip<'bar'>()
    if (!tooltip) return null

    const point = points[tooltip.identifier.dataIndex]
    if (!point) return null
    const tone = warningTone(point)

    return (
        <ChartsTooltipContainer
            {...props}
            trigger="item"
            placement="right-start"
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2.25,
                    minWidth: 220,
                    borderRadius: 2,
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'linear-gradient(140deg, rgba(15,23,42,0.85), rgba(22,28,52,0.92))',
                    boxShadow: '0 22px 60px rgba(4, 6, 18, 0.55)',
                }}>
                <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {point.time}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {point.isBluebird && (
                                <Chip size="small" label="Bluebird" color="primary" variant="outlined" />
                            )}
                            {tone && (
                                <Chip size="small" label={tone.label} color={tone.color} variant="filled" />
                            )}
                        </Stack>
                    </Stack>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
                    <Stack spacing={0.75}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Snow</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{point.inches ?? 0}&quot;</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Precip</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{point.precipInches ?? 0}&quot;</Typography>
                        </Stack>
                        {point.precipProbability != null && (
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Precip chance</Typography>
                                <Typography variant="subtitle1" fontWeight={700}>{point.precipProbability}%</Typography>
                            </Stack>
                        )}
                    </Stack>
                    {point.warning && (
                        <Typography variant="body2" sx={{ color: 'warning.light' }}>
                            {point.warning}
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </ChartsTooltipContainer>
    )
}

export default function CustomChart({ data }: { data: ForecastPoint[] }) {
    const bluebirdWindows = data.filter((point) => point.isBluebird)
    const warningMap = new Map<NonNullable<ForecastPoint['alert']>, {
        alert: NonNullable<ForecastPoint['alert']>
        warning: string | null
        startIndex: number
        endIndex: number
        startLabel: string
        endLabel: string
    }>()

    data.forEach((point, idx) => {
        if (!point.alert) return
        const existing = warningMap.get(point.alert)
        if (!existing) {
            warningMap.set(point.alert, {
                alert: point.alert,
                warning: point.warning,
                startIndex: idx,
                endIndex: idx,
                startLabel: point.time,
                endLabel: point.time,
            })
            return
        }
        if (idx < existing.startIndex) {
            existing.startIndex = idx
            existing.startLabel = point.time
        }
        if (idx > existing.endIndex) {
            existing.endIndex = idx
            existing.endLabel = point.time
        }
    })

    const consolidatedWarnings = Array.from(warningMap.values())
        .sort((a, b) => a.startIndex - b.startIndex)

    const alertDotColor = (alert: ForecastPoint['alert']) => {
        if (alert === 'rain') return '#f87171'
        if (alert === 'light-precip') return '#fbbf24'
        if (alert === 'snow-ongoing') return '#93c5fd'
        return '#a5b4fc'
    }

    const rainBands = (() => {
        const bands: { start: number; end: number }[] = []
        let current: { start: number; end: number } | null = null

        data.forEach((point, idx) => {
            if (point.alert === 'rain') {
                if (!current) {
                    current = { start: idx, end: idx }
                    bands.push(current)
                } else {
                    current.end = idx
                }
            } else {
                current = null
            }
        })

        return bands
    })()

    return (
        <Stack spacing={3.5}>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, rgba(51,107,255,0.15), rgba(12,22,43,0.85))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 18px 48px rgba(4, 8, 20, 0.5)',
                        }}>
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                                Bluebird windows
                            </Typography>
                            {bluebirdWindows.length ? (
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {bluebirdWindows.map((point) => (
                                        <Chip
                                            key={point.startTime}
                                            label={`${point.time}${point.alert === 'light-precip' ? ' · light precip' : ''}`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderColor: alpha('#60a5fa', 0.4), color: '#dbeafe' }}
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
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(12,22,43,0.9))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 18px 48px rgba(4, 8, 20, 0.5)',
                        }}>
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                                Warnings
                            </Typography>
                            {consolidatedWarnings.length ? (
                                <Stack spacing={1}>
                                    {consolidatedWarnings.map((warning) => (
                                        <Stack
                                            key={warning.alert}
                                            direction="row"
                                            spacing={1.5}
                                            alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    mt: 0.75,
                                                    borderRadius: '50%',
                                                    backgroundColor: alertDotColor(warning.alert),
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {warning.startLabel === warning.endLabel
                                                        ? warning.startLabel
                                                        : `${warning.startLabel} - ${warning.endLabel}`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {warning.warning}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No precipitation concerns.
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                                Any rain is flagged. Tiny precip amounts are allowed for bluebird calls but still warned.
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 4,
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(8,13,26,0.95))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 90px rgba(0, 0, 0, 0.45)',
                }}>
                <Stack spacing={2} sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                        <Typography variant="h5">72-hour snowfall outlook</Typography>
                        <Chip label="NOAA · Live" size="small" color="secondary" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Bars show expected snowfall for each window; hover for precipitation details and bluebird cues.
                    </Typography>
                </Stack>

                <Box sx={{ position: 'relative', height: 620 }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 24,
                            bottom: 32,
                            left: 12,
                            right: 24,
                            pointerEvents: 'none',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                        }}>
                        {rainBands.map((band, idx) => {
                            const left = (band.start / data.length) * 100
                            const width = ((band.end - band.start + 1) / data.length) * 100
                            return (
                                <Box
                                    key={`rain-band-${band.start}-${band.end}-${idx}`}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        background: 'linear-gradient(180deg, rgba(244,67,54,0.18) 0%, rgba(244,67,54,0.07) 100%)',
                                        backdropFilter: 'blur(2px)',
                                        borderLeft: '1px solid rgba(244,67,54,0.4)',
                                        borderRight: '1px solid rgba(244,67,54,0.25)',
                                    }}
                                />
                            )
                        })}
                    </Box>
                    <BarChart
                        height={620}
                        dataset={data}
                        xAxis={[{
                            dataKey: 'time',
                            scaleType: 'band',
                            tickLabelStyle: { fill: '#d7e3ff', fontSize: 12, fontWeight: 600 },
                        }]}
                        yAxis={[{
                            label: 'Snow (inches)',
                            labelStyle: { fill: '#cbd5f5', fontSize: 12 },
                            tickLabelStyle: { fill: '#cbd5f5', fontSize: 12 },
                        }]}
                        series={[
                            {
                                id: 'snowfall',
                                dataKey: 'inches',
                                minBarSize: 6,
                                valueFormatter: (value) => value == null ? '' : `${value}"`,
                                barLabel: ({ value }) => value == null || value === 0 ? null : `${value}`,
                                barLabelPlacement: 'outside',
                                color: '#5da2ff',
                                colorGetter: ({ dataIndex }) => barColor(data[dataIndex]),
                            },
                        ]}
                        grid={{ horizontal: true }}
                        margin={{ top: 24, right: 24, bottom: 32, left: 12 }}
                        borderRadius={10}
                        hideLegend
                        slots={{
                            tooltip: (tooltipProps) => (
                                <ForecastTooltip {...tooltipProps} points={data} />
                            ),
                        }}
                        slotProps={{
                            tooltip: { trigger: 'item' },
                            barLabel: { style: { fill: '#e5edff', fontSize: 12, fontWeight: 700 } },
                        }}
                    />
                </Box>
            </Paper>
        </Stack>
    )
}
