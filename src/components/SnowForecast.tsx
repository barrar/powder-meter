import CustomChart from './CustomChart'
import { getWeatherData } from '../data/getWeatherData'
import type { ForecastLocationId } from '../data/forecastLocations'

// Server component to load data and pass to client component
// Allows for suspense in parent component
// Data is streamed durring initial request
type SnowForecastProps = {
    locationId?: ForecastLocationId
}

export default async function SnowForecast({ locationId }: SnowForecastProps) {
    const data = await getWeatherData(locationId)

    return (
        <CustomChart data={data} />
    );
}