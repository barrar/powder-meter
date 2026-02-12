import type { ForecastLocation } from "@/data/forecastLocations";
import type { NOAAValue } from "@/data/weather/forecastTypes";

const NOAA_USER_AGENT = "(powdermeter.com, contact@powdermeter.com)";

export type NOAAGridpointResponse = {
  properties?: {
    snowfallAmount?: { values?: NOAAValue[] };
    quantitativePrecipitation?: { values?: NOAAValue[] };
    probabilityOfPrecipitation?: { values?: NOAAValue[] };
    temperature?: { values?: NOAAValue[] };
    windSpeed?: { values?: NOAAValue[] };
    windGust?: { values?: NOAAValue[] };
    skyCover?: { values?: NOAAValue[] };
  };
};

export const fetchGridpointData = async (location: ForecastLocation): Promise<NOAAGridpointResponse> => {
  const url = `https://api.weather.gov/gridpoints/${location.gridpoints.office}/${location.gridpoints.x},${location.gridpoints.y}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": NOAA_USER_AGENT,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch NOAA gridpoint data (${res.status} ${res.statusText})`);
  }
  return (await res.json()) as NOAAGridpointResponse;
};
