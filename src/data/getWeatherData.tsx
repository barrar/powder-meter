"use server"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { getForecastLocation, type ForecastLocationId } from "./forecastLocations"

dayjs.extend(utc)

type NOAAValue = { validTime: string; value: number | string | null }

export type ForecastPoint = {
    time: string
    startTime: string
    inches: number | null
    precipInches: number | null
    precipProbability: number | null
    temperatureF: number | null
    windMph: number | null
    cloudCover: number | null
    precipitationType: 'snow' | 'rain' | 'none'
    hasFreshPowder: boolean
    isBluebird: boolean
    alert: 'rain' | 'light-precip' | 'snow-ongoing' | null
    warning: string | null
}

const parseNumber = (value: number | string | null | undefined) => {
    if (value == null) return null
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const matches = value.match(/-?\d+(\.\d+)?/g)
    if (!matches) return null
    const numbers = matches
        .map((match) => Number(match))
        .filter((number) => Number.isFinite(number))
    if (!numbers.length) return null
    if (numbers.length >= 2) {
        return (numbers[0] + numbers[1]) / 2
    }
    return numbers[0]
}

const mmToInches = (millimeters: number | string | null | undefined) => {
    const numeric = parseNumber(millimeters)
    if (numeric == null) return 0
    return Math.round(numeric * 0.0393701 * 100) / 100
}

const validStart = (validTime: string) => validTime.replace(/\/.*$/, "")
const cToF = (celsius: number | null) => (
    celsius == null ? null : Math.round((celsius * 9 / 5 + 32) * 10) / 10
)
const kmhToMph = (kmh: number | null) => (
    kmh == null ? null : Math.round(kmh * 0.621371 * 10) / 10
)
const fillNearest = (times: string[], values: Array<number | null>) => {
    if (!values.length) return values
    const timeMs = times.map((time) => dayjs.utc(time).valueOf())
    const prevValue: Array<number | null> = new Array(values.length).fill(null)
    const prevTime: Array<number | null> = new Array(values.length).fill(null)
    let lastValue: number | null = null
    let lastTime: number | null = null
    values.forEach((value, idx) => {
        if (value != null) {
            lastValue = value
            lastTime = timeMs[idx]
        }
        prevValue[idx] = lastValue
        prevTime[idx] = lastTime
    })

    const nextValue: Array<number | null> = new Array(values.length).fill(null)
    const nextTime: Array<number | null> = new Array(values.length).fill(null)
    let upcomingValue: number | null = null
    let upcomingTime: number | null = null
    for (let idx = values.length - 1; idx >= 0; idx -= 1) {
        if (values[idx] != null) {
            upcomingValue = values[idx]
            upcomingTime = timeMs[idx]
        }
        nextValue[idx] = upcomingValue
        nextTime[idx] = upcomingTime
    }

    return values.map((value, idx) => {
        if (value != null) return value
        const previous = prevValue[idx]
        const next = nextValue[idx]
        if (previous == null && next == null) return null
        if (previous == null) return next
        if (next == null) return previous
        const prevDistance = timeMs[idx] - (prevTime[idx] ?? timeMs[idx])
        const nextDistance = (nextTime[idx] ?? timeMs[idx]) - timeMs[idx]
        return prevDistance <= nextDistance ? previous : next
    })
}

export async function getWeatherData(locationId?: ForecastLocationId): Promise<ForecastPoint[]> {
    const location = getForecastLocation(locationId)
    const res = await fetch(
        `https://api.weather.gov/gridpoints/${location.gridpoints.office}/${location.gridpoints.x},${location.gridpoints.y}`,
        {
            headers: { 'user-agent': '(modernsnow.com, contact@modernsnow.com)' },
            next: { revalidate: 10 }
        }
    )
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    const data = await res.json()

    const snowfall = (data.properties.snowfallAmount?.values ?? []) as NOAAValue[]
    const quantitativePrecip = (data.properties.quantitativePrecipitation?.values ?? []) as NOAAValue[]
    const precipProbability = (data.properties.probabilityOfPrecipitation?.values ?? []) as NOAAValue[]
    const temperature = (data.properties.temperature?.values ?? []) as NOAAValue[]
    const windSpeed = (data.properties.windSpeed?.values ?? []) as NOAAValue[]
    const skyCover = (data.properties.skyCover?.values ?? []) as NOAAValue[]

    const baseSeries = snowfall.length
        ? snowfall
        : temperature.length
            ? temperature
            : precipProbability
    const baseTimes = baseSeries.map((entry) => validStart(entry.validTime))

    const snowByStart = new Map<string, number | null>(snowfall.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))
    const precipByStart = new Map<string, number | null>(quantitativePrecip.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))
    const probByStart = new Map<string, number | null>(precipProbability.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))
    const tempByStart = new Map<string, number | null>(temperature.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))
    const windByStart = new Map<string, number | null>(windSpeed.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))
    const cloudByStart = new Map<string, number | null>(skyCover.map((entry) => [
        validStart(entry.validTime),
        parseNumber(entry.value),
    ]))

    const tempValues = fillNearest(baseTimes, baseTimes.map((start) => tempByStart.get(start) ?? null))
    const windValues = fillNearest(baseTimes, baseTimes.map((start) => windByStart.get(start) ?? null))
    const cloudValues = fillNearest(baseTimes, baseTimes.map((start) => cloudByStart.get(start) ?? null))

    return baseSeries.map((entry, idx) => {
        const start = validStart(entry.validTime)
        const snowInches = mmToInches(snowByStart.get(start))
        const precipInches = mmToInches(precipByStart.get(start))
        const probability = probByStart.get(start) ?? null
        const temperatureF = cToF(tempValues[idx] ?? null)
        const windMph = kmhToMph(windValues[idx] ?? null)
        const cloudCoverRaw = cloudValues[idx] ?? null
        const cloudCover = cloudCoverRaw == null ? null : Math.round(cloudCoverRaw)

        const hasFreshPowder = snowInches >= 0.5
        const hasPrecip = precipInches > 0
        const minorPrecip = precipInches > 0 && precipInches <= 0.05
        const precipType: ForecastPoint['precipitationType'] =
            hasPrecip && snowInches === 0 ? 'rain' :
                hasPrecip ? 'snow' : 'none'

        const alert: ForecastPoint['alert'] =
            precipType === 'rain' ? 'rain' :
                minorPrecip ? 'light-precip' :
                    hasPrecip ? 'snow-ongoing' : null

        const warning =
            alert === 'rain'
                ? 'Rain expected — conditions will be wet.'
                : alert === 'light-precip'
                    ? 'Light precip in this window; mostly clear but keep an eye out.'
                    : alert === 'snow-ongoing'
                        ? 'Snow continues during this window.'
                        : null

        const isBluebird = hasFreshPowder && (!hasPrecip || minorPrecip)

        return {
            time: dayjs.utc(start)
                .format("dd ha")
                .replace(/\m$/, ""),
            startTime: start,
            inches: snowInches !== 0 ? snowInches : null,
            precipInches: precipInches !== 0 ? precipInches : null,
            precipProbability: probability,
            temperatureF,
            windMph,
            cloudCover,
            precipitationType: precipType,
            hasFreshPowder,
            isBluebird,
            alert,
            warning,
        }
    })
        .slice(0, 22)
}
