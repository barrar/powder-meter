"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getForecastLocation, type ForecastLocationId } from "./forecastLocations";
import { buildCacheKey, readCachedGridData, writeCachedGridData } from "./weather/cache";
import { fetchGridpointData, type NOAAGridpointResponse } from "./weather/noaaApi";
import type { ForecastPoint } from "./weather/forecastTypes";
import {
  cToF,
  fillNearest,
  intervalStart,
  kmhToMph,
  mmToInches,
  parseInterval,
  parseNumber,
} from "./weather/forecastUtils";

dayjs.extend(utc);

export async function getWeatherData(locationId?: ForecastLocationId): Promise<ForecastPoint[]> {
  const nowUtc = dayjs.utc();
  const location = getForecastLocation(locationId);
  const cacheKey = buildCacheKey(location);
  const cachedData = await readCachedGridData<NOAAGridpointResponse>(cacheKey);
  const data = cachedData ?? (await fetchGridpointData(location));

  if (!cachedData) {
    await writeCachedGridData(cacheKey, data);
  }

  const properties = data?.properties ?? {};
  const snowfall = properties.snowfallAmount?.values ?? [];
  const quantitativePrecip = properties.quantitativePrecipitation?.values ?? [];
  const precipProbability = properties.probabilityOfPrecipitation?.values ?? [];
  const temperature = properties.temperature?.values ?? [];
  const windSpeed = properties.windSpeed?.values ?? [];
  const windGust = properties.windGust?.values ?? [];
  const skyCover = properties.skyCover?.values ?? [];

  const baseSeries = snowfall.length ? snowfall : temperature.length ? temperature : precipProbability;
  if (!baseSeries.length) return [];

  const baseTimes = baseSeries.map((entry) => intervalStart(entry.validTime));

  const snowByStart = new Map<string, number | null>(
    snowfall.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const precipByStart = new Map<string, number | null>(
    quantitativePrecip.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const probByStart = new Map<string, number | null>(
    precipProbability.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const tempByStart = new Map<string, number | null>(
    temperature.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const windByStart = new Map<string, number | null>(
    windSpeed.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const windGustByStart = new Map<string, number | null>(
    windGust.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );
  const cloudByStart = new Map<string, number | null>(
    skyCover.map((entry) => [intervalStart(entry.validTime), parseNumber(entry.value)]),
  );

  const tempValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => tempByStart.get(start) ?? null),
  );
  const probValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => probByStart.get(start) ?? null),
  );
  const windValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => windByStart.get(start) ?? null),
  );
  const windGustValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => windGustByStart.get(start) ?? null),
  );
  const cloudValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => cloudByStart.get(start) ?? null),
  );

  return baseSeries
    .map((entry, idx) => {
      const { start, end } = parseInterval(entry.validTime);
      const snowInches = mmToInches(snowByStart.get(start));
      const precipInches = mmToInches(precipByStart.get(start));
      const probability = probValues[idx] ?? null;
      const temperatureF = cToF(tempValues[idx] ?? null);
      const windMph = kmhToMph(windValues[idx] ?? null);
      const windGustMph = kmhToMph(windGustValues[idx] ?? null);
      const cloudCoverRaw = cloudValues[idx] ?? null;
      const cloudCover = cloudCoverRaw == null ? null : Math.round(cloudCoverRaw);

      const hasFreshPowder = snowInches >= 0.5;
      const precipType: ForecastPoint["precipitationType"] =
        precipInches > 0 && snowInches === 0 ? "rain" : precipInches > 0 ? "snow" : "none";
      const hasRainChance = probability != null && probability > 15;

      const alert: ForecastPoint["alert"] = precipType === "rain" && hasRainChance ? "rain" : null;

      const isBluebird = hasFreshPowder && precipInches === 0;

      return {
        time: dayjs.utc(start).toISOString(),
        startTime: start,
        endTime: end,
        inches: snowInches !== 0 ? snowInches : null,
        precipInches: precipInches !== 0 ? precipInches : null,
        precipProbability: probability,
        temperatureF,
        windMph,
        windGustMph,
        cloudCover,
        precipitationType: precipType,
        hasFreshPowder,
        isBluebird,
        alert,
      };
    })
    .filter((point) => dayjs.utc(point.endTime).isAfter(nowUtc))
    .slice(0, 22);
}
