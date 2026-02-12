"use client";

import { FormControl, InputLabel, MenuItem, Select, Stack, type SelectChangeEvent } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import type { ForecastLocation, ForecastState, ForecastStateOption } from "@/data/forecastLocations";
import { buildLocationRoute, buildStateRoute } from "@/components/location/locationQueryParams";

export type LocationMenuProps = {
  locations: ForecastLocation[];
  states: ForecastStateOption[];
  stateValue: ForecastState;
  value: ForecastLocation["id"];
};

export default function LocationMenu({ locations, states, stateValue, value }: LocationMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateLocations = locations.filter((location) => location.state === stateValue);
  const resolvedLocationValue =
    stateLocations.find((location) => location.id === value)?.id ?? stateLocations[0]?.id ?? value;

  const handleLocationChange = (event: SelectChangeEvent) => {
    const nextRoute = buildLocationRoute(searchParams, String(event.target.value));
    router.push(nextRoute);
    router.refresh();
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    const nextState = event.target.value as ForecastState;
    const nextRoute = buildStateRoute(searchParams, nextState, locations);
    router.push(nextRoute);
    router.refresh();
  };

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ width: "100%" }}>
      <FormControl
        size="small"
        sx={{
          width: "100%",
          flex: 1,
          minWidth: 0,
        }}
      >
        <InputLabel id="state-select-label">State</InputLabel>
        <Select
          labelId="state-select-label"
          label="State"
          value={stateValue}
          onChange={handleStateChange}
          MenuProps={{
            PaperProps: {
              sx: { bgcolor: "background.default" },
            },
          }}
        >
          {states.map((state) => (
            <MenuItem key={state.id} value={state.id}>
              {state.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        size="small"
        sx={{
          width: "100%",
          flex: 1,
          minWidth: 0,
        }}
      >
        <InputLabel id="location-select-label">Location</InputLabel>
        <Select
          labelId="location-select-label"
          label="Location"
          value={resolvedLocationValue}
          onChange={handleLocationChange}
          MenuProps={{
            PaperProps: {
              sx: { bgcolor: "background.default" },
            },
          }}
        >
          {stateLocations.map((location) => (
            <MenuItem key={location.id} value={location.id}>
              {location.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
