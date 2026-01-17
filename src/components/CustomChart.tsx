'use client'

import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartContainer } from '@mui/x-charts/ChartContainer'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { LinePlot } from '@mui/x-charts/LineChart'
import {
    ChartsTooltipContainer,
    useAxesTooltip,
} from '@mui/x-charts/ChartsTooltip'
import type { ForecastPoint } from '../data/getWeatherData'

const warningTone = (point: ForecastPoint) => {
    if (point.alert === 'rain') return { label: 'Rain risk', color: 'error' as const }
    if (point.alert === 'light-precip') return { label: 'Light precip', color: 'warning' as const }
    if (point.alert === 'snow-ongoing') return { label: 'Snow ongoing', color: 'secondary' as const }
    if (point.isBluebird) return { label: 'Bluebird', color: 'info' as const }
    return null
}

const ForecastTooltip = ({ points }: { points: ForecastPoint[] }) => {
    const tooltips = useAxesTooltip({ directions: ['x'] })
    const tooltip = tooltips?.[0]
    if (!tooltip) return null

    const point = points[tooltip.dataIndex]
    if (!point) return null
    const tone = warningTone(point)

    return (
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
                    {point.temperatureF != null && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Temperature</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{Math.round(point.temperatureF)}°F</Typography>
                        </Stack>
                    )}
                    {point.windMph != null && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Wind</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{point.windMph} mph</Typography>
                        </Stack>
                    )}
                    {point.cloudCover != null && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Cloud cover</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{point.cloudCover}%</Typography>
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

    const weatherSeries = [
        {
            id: 'temperature',
            label: 'Temp (°F)',
            type: 'line' as const,
            dataKey: 'temperatureF',
            yAxisId: 'weather',
            color: '#fbbf24',
            valueFormatter: (value: number | null) => value == null ? '' : `${Math.round(value)}°F`,
            showMark: false,
        },
        {
            id: 'wind',
            label: 'Wind (mph)',
            type: 'line' as const,
            dataKey: 'windMph',
            yAxisId: 'weather',
            color: '#22c55e',
            valueFormatter: (value: number | null) => value == null ? '' : `${value} mph`,
            showMark: false,
        },
        {
            id: 'cloud',
            label: 'Cloud cover (%)',
            type: 'line' as const,
            dataKey: 'cloudCover',
            yAxisId: 'weather',
            color: '#a855f7',
            valueFormatter: (value: number | null) => value == null ? '' : `${value}%`,
            showMark: false,
        },
    ] as const

    const series = [
        {
            id: 'snowfall',
            label: 'Snow (in)',
            type: 'bar' as const,
            dataKey: 'inches',
            yAxisId: 'snow',
            minBarSize: 6,
            color: '#5da2ff',
            valueFormatter: (value: number | null) => value == null ? '' : `${value}"`,
            barLabel: ({ value }: { value: number | null }) => value == null || value === 0 ? null : `${value}`,
            barLabelPlacement: 'outside' as const,
        },
        ...weatherSeries,
    ]

    const legendItems = [
        { id: 'snowfall', label: 'Snow (in)', color: '#5da2ff' },
        ...weatherSeries,
    ]

    return (
        <Stack spacing={3}>
            <Grid container spacing={3}>
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
                <Stack sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                        <Typography variant="h5">Snowfall outlook</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Bars show expected snowfall for each window; lines show temperature, wind, and cloud cover.
                    </Typography>
                </Stack>

                <Box sx={{ position: 'relative', height: 520 }}>
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
                    <ChartContainer
                        height={520}
                        dataset={data}
                        series={series}
                        xAxis={[{
                            id: 'time',
                            dataKey: 'time',
                            scaleType: 'band',
                            tickLabelStyle: { fill: '#d7e3ff', fontSize: 12, fontWeight: 600 },
                        }]}
                        yAxis={[
                            {
                                id: 'snow',
                                label: 'Snow (inches)',
                                labelStyle: { fill: '#cbd5f5', fontSize: 12 },
                                tickLabelStyle: { fill: '#cbd5f5', fontSize: 12 },
                            },
                            {
                                id: 'weather',
                                label: 'Temp / Wind / Cloud',
                                position: 'right',
                                labelStyle: { fill: '#cbd5f5', fontSize: 12 },
                                tickLabelStyle: { fill: '#cbd5f5', fontSize: 12 },
                            },
                        ]}
                        margin={{ top: 24, right: 36, bottom: 32, left: 12 }}
                    >
                        <ChartsGrid horizontal />
                        <BarPlot
                            slotProps={{
                                barLabel: { style: { fill: '#e5edff', fontSize: 12, fontWeight: 700 } },
                            }}
                        />
                        <LinePlot />
                        <ChartsXAxis axisId="time" />
                        <ChartsYAxis axisId="snow" />
                        <ChartsYAxis axisId="weather" />
                        <ChartsTooltipContainer trigger="axis" placement="right-start">
                            <ForecastTooltip points={data} />
                        </ChartsTooltipContainer>
                    </ChartContainer>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="flex-end">
                        {legendItems.map((series) => (
                            <Stack key={series.id} direction="row" spacing={0.75} alignItems="center">
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: series.color }} />
                                <Typography variant="caption">
                                    {series.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    )
}
