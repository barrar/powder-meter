"use server"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

type NOAAValue = { validTime: string; value: number | null }

export type ForecastPoint = {
    time: string
    startTime: string
    inches: number | null
    precipInches: number | null
    precipProbability: number | null
    precipitationType: 'snow' | 'rain' | 'none'
    hasFreshPowder: boolean
    isBluebird: boolean
    alert: 'rain' | 'light-precip' | 'snow-ongoing' | null
    warning: string | null
}

const mmToInches = (millimeters: number | null | undefined) => {
    if (millimeters == null) return 0
    return Math.round(millimeters * 0.0393701 * 100) / 100
}

const validStart = (validTime: string) => validTime.replace(/\/.*$/, "")

export async function getWeatherData(): Promise<ForecastPoint[]> {
    const res = await fetch(
        'https://api.weather.gov/gridpoints/PDT/23,39',
        {
            headers: { 'user-agent': '(modernsnow.com, contact@modernsnow.com)' },
            next: { revalidate: 10 }
        }
    )
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    const data = await res.json()

    const snowfall = data.properties.snowfallAmount.values as NOAAValue[]
    const quantitativePrecip = data.properties.quantitativePrecipitation.values as NOAAValue[]
    const precipProbability = data.properties.probabilityOfPrecipitation.values as NOAAValue[]

    const precipByStart = new Map<string, number | null>(quantitativePrecip.map((entry) => [
        validStart(entry.validTime),
        entry.value,
    ]))
    const probByStart = new Map<string, number | null>(precipProbability.map((entry) => [
        validStart(entry.validTime),
        entry.value,
    ]))

    return snowfall.map((entry) => {
        const start = validStart(entry.validTime)
        const snowInches = mmToInches(entry.value)
        const precipInches = mmToInches(precipByStart.get(start))
        const probability = probByStart.get(start) ?? null

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
            precipitationType: precipType,
            hasFreshPowder,
            isBluebird,
            alert,
            warning,
        }
    })
        .slice(0, 22)
}
