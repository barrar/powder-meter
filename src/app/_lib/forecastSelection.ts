import {
  forecastLocations,
  forecastStates,
  getForecastLocation,
  getForecastLocationsForState,
} from "@/data/forecastLocations";

export type SearchParams = {
  location?: string | string[];
};

const resolveParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const resolveForecastSelection = (searchParams?: SearchParams) => {
  const locationParam = resolveParam(searchParams?.location);
  const locationFromParam = getForecastLocation(locationParam);
  const resolvedState = locationFromParam.state;
  const stateLocations = getForecastLocationsForState(resolvedState);
  const location =
    stateLocations.find((item) => item.id === locationFromParam.id) ?? stateLocations[0] ?? locationFromParam;

  return {
    locationId: location.id,
    timeZoneValue: location.timeZoneId,
    menu: {
      locations: forecastLocations,
      states: forecastStates,
      stateValue: resolvedState,
      value: location.id,
    },
  };
};
