import SnowForecast from '../components/SnowForecast';
import dayjs from "dayjs"

async function getWeatherData() {
  const res = await fetch(
    'https://api.weather.gov/gridpoints/PDT/23,40',
    {
      headers: { 'user-agent': '(modernsnow.com, contact@modernsnow.com)' }
    }
  )
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const data = await res.json()

  const snowfallAmount = data.properties.snowfallAmount.values
  const values: number[] = Array.from(snowfallAmount.map((x: { value: number; }) =>
    Math.round(x.value * 0.0393701 * 10) / 10
  ))
  const dates: string[] = Array.from(snowfallAmount.map((x: { validTime: string; }) =>
    dayjs(x.validTime.replace(/\/.*$/, "")).format("ddd ha")
  ))

  return { dates: dates, values: values }
}

async function getWeatherDataOWM() {
  const res = await fetch('https://api.openweathermap.org/data/2.5/forecast?lat=43.9793&lon=-121.6884&appid=ee0e5170eeccaeb3ba4adc21bd8ff6f2')
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data = await res.json()

  const values: number[] = Array.from(data.list.map((x: { snow: { [x: string]: any; }; }) =>
    x.snow?.['3h'] ?? 0
  ))
  const dates: string[] = Array.from(data.list.map((x: { dt: number; }) =>
    dayjs(x.dt * 1000).format("ddd ha")
  ))

  return { dates: dates, values: values }
}

export default async function Page() {
  const weatherData = await getWeatherData()


  const weatherDataOWM = await getWeatherDataOWM()


  return (
    <div className="grow p-10 max-h-96">
      <h1>Snowfall Forecast</h1>
      <h2>api.weather.gov</h2>
      <SnowForecast data={weatherData} />
      <h2>api.openweathermap.org</h2>
      <SnowForecast data={weatherDataOWM} />
    </div>
  )
}
