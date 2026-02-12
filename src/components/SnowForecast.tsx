import CustomChartClient from "@/components/chart/CustomChartClient";
import type { ForecastLocationId } from "@/data/forecastLocations";
import { getWeatherData } from "@/data/getWeatherData";
import type { TimeZoneId } from "@/data/timeZones";
import type { ForecastPoint } from "@/data/weather/forecastTypes";

type SnowForecastProps = {
  locationId?: ForecastLocationId;
  timeZoneId: TimeZoneId;
};

const loadSnowForecast = async (locationId?: ForecastLocationId): Promise<ForecastPoint[]> => getWeatherData(locationId);

export default async function SnowForecast({ locationId, timeZoneId }: SnowForecastProps) {
  const data = await loadSnowForecast(locationId);

  return <CustomChartClient data={data} timeZone={timeZoneId} />;
}
