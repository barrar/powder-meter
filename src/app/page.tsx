import SnowForecast from '../components/SnowForecast';
import dayjs from "dayjs"

async function getWeatherData() {
  const res = await fetch(
    'https://api.weather.gov/gridpoints/PDT/23,40',
    {
      headers: { 'user-agent': '(modernsnow.com, contact@modernsnow.com)' },
      next: { revalidate: 60 * 10 }
    }
  )
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const data = await res.json()

  // Need to get data for temperature, windspeed, cloud coverage etc 
  // Only get values for dates that exist in the snowfallAmount object

  return data.properties.snowfallAmount.values.map((x: { validTime: string; value: number; }) => {
    let inchesValue = Math.round(x.value * 0.0393701 * 10) / 10

    return {
      time: dayjs(x.validTime.replace(/\/.*$/, ""))
        .format("dd ha")
        .replace(/\m$/, ""), // Remove trailing m from am/pm
      inches: inchesValue !== 0 ? inchesValue : null
    }
  })
    .slice(0, 22)
}

export default async function Page() {
  const weatherData = await getWeatherData()

  return (
    <div className="grow p-10">
      <h1>Mt. Bachelor Snow Forecast</h1>
      <SnowForecast data={weatherData} />
    </div>
  )
}
