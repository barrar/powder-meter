import CustomChartClient from "@/components/CustomChartClient";
import type { ForecastLocationId } from "@/data/forecastLocations";
import { getWeatherData } from "@/data/getWeatherData";
import type { TimeZoneId } from "@/data/timeZones";

type SnowForecastProps = {
  locationId?: ForecastLocationId;
  timeZoneId: TimeZoneId;
};

const loadSnowForecast = async (locationId?: ForecastLocationId) => getWeatherData(locationId);

export default async function SnowForecast({ locationId, timeZoneId }: SnowForecastProps) {
  const data = await loadSnowForecast(locationId);

  return <CustomChartClient data={data} timeZone={timeZoneId} />;
}
