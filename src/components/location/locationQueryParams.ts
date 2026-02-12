import type { ForecastLocation, ForecastState } from "@/data/forecastLocations";

type SearchParamsLike = { toString(): string } | null | undefined;

const toRoute = (params: URLSearchParams) => {
  const query = params.toString();
  return query ? `/?${query}` : "/";
};

const cloneSearchParams = (searchParams: SearchParamsLike) => new URLSearchParams(searchParams?.toString());

export const buildLocationRoute = (searchParams: SearchParamsLike, locationId: string) => {
  const params = cloneSearchParams(searchParams);
  params.set("location", locationId);
  params.delete("timezone");
  return toRoute(params);
};

export const buildStateRoute = (
  searchParams: SearchParamsLike,
  nextState: ForecastState,
  locations: ForecastLocation[],
) => {
  const params = cloneSearchParams(searchParams);
  const nextLocation = locations.find((location) => location.state === nextState);
  if (nextLocation) {
    params.set("location", nextLocation.id);
  } else {
    params.delete("location");
  }
  params.delete("timezone");
  return toRoute(params);
};
