"use server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createClient } from "redis";
import { getForecastLocation, type ForecastLocationId } from "./forecastLocations";

dayjs.extend(utc);

const CACHE_TTL_SECONDS = 4 * 60 * 60; // 4 hours

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let redisClientPromise: Promise<RedisClient | null> | null = null;

const getRedisClient = async (): Promise<RedisClient | null> => {
  const redisUrl = process.env.REDIS_ROSE_OCEAN_REDIS_URL;
  if (!redisUrl) return null;
  if (redisClient) return redisClient;
  if (!redisClientPromise) {
    const client = createClient({ url: redisUrl });
    redisClientPromise = client
      .connect()
      .then(() => {
        redisClient = client;
        return client;
      })
      .catch((error) => {
        redisClientPromise = null;
        console.warn("Failed to connect to Redis", error);
        return null;
      });
  }
  return redisClientPromise;
};

type CachedGridData = {
  data: unknown;
};

const buildCacheKey = (location: ReturnType<typeof getForecastLocation>) =>
  `weather-grid:${location.gridpoints.office}:${location.gridpoints.x},${location.gridpoints.y}`;

const readCachedGridData = async (cacheKey: string) => {
  const client = await getRedisClient();
  if (!client) return null;
  try {
    const cached = await client.get(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CachedGridData | unknown;
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      const payload = parsed as CachedGridData;
      if (payload.data == null) return null;
      return payload.data;
    }
    return parsed;
  } catch (error) {
    console.warn("Redis cache read failed", error);
    return null;
  }
};

const writeCachedGridData = async (cacheKey: string, data: unknown) => {
  const client = await getRedisClient();
  if (!client) return;
  try {
    const payload: CachedGridData = { data };
    await client.set(cacheKey, JSON.stringify(payload), {
      expiration: { type: "EX", value: CACHE_TTL_SECONDS },
    });
  } catch (error) {
    console.warn("Redis cache write failed", error);
  }
};

type NOAAValue = { validTime: string; value: number | string | null };

export type ForecastPoint = {
  time: string;
  startTime: string;
  inches: number | null;
  precipInches: number | null;
  precipProbability: number | null;
  temperatureF: number | null;
  windMph: number | null;
  windGustMph: number | null;
  cloudCover: number | null;
  precipitationType: "snow" | "rain" | "none";
  hasFreshPowder: boolean;
  isBluebird: boolean;
  alert: "rain" | null;
};

const parseNumber = (value: number | string | null | undefined) => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const matches = value.match(/-?\d+(\.\d+)?/g);
  if (!matches) return null;
  const numbers = matches.map((match) => Number(match)).filter((number) => Number.isFinite(number));
  if (!numbers.length) return null;
  if (numbers.length >= 2) {
    return (numbers[0] + numbers[1]) / 2;
  }
  return numbers[0];
};

const mmToInches = (millimeters: number | string | null | undefined) => {
  const numeric = parseNumber(millimeters);
  if (numeric == null) return 0;
  return Math.round(numeric * 0.0393701 * 100) / 100;
};

const validStart = (validTime: string) => validTime.replace(/\/.*$/, "");
const cToF = (celsius: number | null) => (celsius == null ? null : Math.round(((celsius * 9) / 5 + 32) * 10) / 10);
const kmhToMph = (kmh: number | null) => (kmh == null ? null : Math.round(kmh * 0.621371 * 10) / 10);
const fillNearest = (times: string[], values: Array<number | null>) => {
  if (!values.length) return values;
  const timeMs = times.map((time) => dayjs.utc(time).valueOf());
  const prevValue: Array<number | null> = new Array(values.length).fill(null);
  const prevTime: Array<number | null> = new Array(values.length).fill(null);
  let lastValue: number | null = null;
  let lastTime: number | null = null;
  values.forEach((value, idx) => {
    if (value != null) {
      lastValue = value;
      lastTime = timeMs[idx];
    }
    prevValue[idx] = lastValue;
    prevTime[idx] = lastTime;
  });

  const nextValue: Array<number | null> = new Array(values.length).fill(null);
  const nextTime: Array<number | null> = new Array(values.length).fill(null);
  let upcomingValue: number | null = null;
  let upcomingTime: number | null = null;
  for (let idx = values.length - 1; idx >= 0; idx -= 1) {
    if (values[idx] != null) {
      upcomingValue = values[idx];
      upcomingTime = timeMs[idx];
    }
    nextValue[idx] = upcomingValue;
    nextTime[idx] = upcomingTime;
  }

  return values.map((value, idx) => {
    if (value != null) return value;
    const previous = prevValue[idx];
    const next = nextValue[idx];
    if (previous == null && next == null) return null;
    if (previous == null) return next;
    if (next == null) return previous;
    const prevDistance = timeMs[idx] - (prevTime[idx] ?? timeMs[idx]);
    const nextDistance = (nextTime[idx] ?? timeMs[idx]) - timeMs[idx];
    return prevDistance <= nextDistance ? previous : next;
  });
};

export async function getWeatherData(locationId?: ForecastLocationId): Promise<ForecastPoint[]> {
  const location = getForecastLocation(locationId);
  const cacheKey = buildCacheKey(location);
  const cachedData = await readCachedGridData(cacheKey);
  const data =
    cachedData ??
    (await (async () => {
      const res = await fetch(
        `https://api.weather.gov/gridpoints/${location.gridpoints.office}/${location.gridpoints.x},${location.gridpoints.y}`,
        {
          headers: {
            "user-agent": "(powdermeter.com, contact@powdermeter.com)",
          },
          cache: "no-store",
        },
      );
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const json = await res.json();
      await writeCachedGridData(cacheKey, json);
      return json;
    })());

  const snowfall = (data.properties.snowfallAmount?.values ?? []) as NOAAValue[];
  const quantitativePrecip = (data.properties.quantitativePrecipitation?.values ?? []) as NOAAValue[];
  const precipProbability = (data.properties.probabilityOfPrecipitation?.values ?? []) as NOAAValue[];
  const temperature = (data.properties.temperature?.values ?? []) as NOAAValue[];
  const windSpeed = (data.properties.windSpeed?.values ?? []) as NOAAValue[];
  const windGust = (data.properties.windGust?.values ?? []) as NOAAValue[];
  const skyCover = (data.properties.skyCover?.values ?? []) as NOAAValue[];

  const baseSeries = snowfall.length ? snowfall : temperature.length ? temperature : precipProbability;
  const baseTimes = baseSeries.map((entry) => validStart(entry.validTime));

  const snowByStart = new Map<string, number | null>(snowfall.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]));
  const precipByStart = new Map<string, number | null>(
    quantitativePrecip.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]),
  );
  const probByStart = new Map<string, number | null>(
    precipProbability.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]),
  );
  const tempByStart = new Map<string, number | null>(temperature.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]));
  const windByStart = new Map<string, number | null>(windSpeed.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]));
  const windGustByStart = new Map<string, number | null>(windGust.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]));
  const cloudByStart = new Map<string, number | null>(skyCover.map((entry) => [validStart(entry.validTime), parseNumber(entry.value)]));

  const tempValues = fillNearest(
    baseTimes,
    baseTimes.map((start) => tempByStart.get(start) ?? null),
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
      const start = validStart(entry.validTime);
      const snowInches = mmToInches(snowByStart.get(start));
      const precipInches = mmToInches(precipByStart.get(start));
      const probability = probByStart.get(start) ?? null;
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
    .slice(0, 22);
}
