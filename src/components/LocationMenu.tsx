"use client";

import { FormControl, InputLabel, MenuItem, Select, Stack, type SelectChangeEvent } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ForecastLocation, ForecastState, ForecastStateOption } from "../data/forecastLocations";
import type { TimeZoneId, TimeZoneOption } from "../data/timeZones";

export type LocationMenuProps = {
  locations: ForecastLocation[];
  states: ForecastStateOption[];
  stateValue: ForecastState;
  value: ForecastLocation["id"];
  timeZoneOptions: readonly TimeZoneOption[];
  timeZoneValue: TimeZoneId;
};

export default function LocationMenu({ locations, states, stateValue, value, timeZoneOptions, timeZoneValue }: LocationMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateLocations = locations.filter((location) => location.state === stateValue);
  const resolvedLocationValue = stateLocations.find((location) => location.id === value)?.id ?? stateLocations[0]?.id ?? value;

  const handleLocationChange = (event: SelectChangeEvent) => {
    const nextLocation = event.target.value;
    const params = new URLSearchParams(searchParams?.toString());
    params.set("location", String(nextLocation));
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
    router.refresh();
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    const nextState = event.target.value as ForecastState;
    const params = new URLSearchParams(searchParams?.toString());
    const nextLocation = locations.find((location) => location.state === nextState);
    if (nextLocation) {
      params.set("location", nextLocation.id);
    } else {
      params.delete("location");
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
    router.refresh();
  };

  const handleTimeZoneChange = (event: SelectChangeEvent) => {
    const nextTimeZone = event.target.value;
    const params = new URLSearchParams(searchParams?.toString());
    if (nextTimeZone) {
      params.set("timezone", String(nextTimeZone));
    } else {
      params.delete("timezone");
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
    router.refresh();
  };

  useEffect(() => {
    if (searchParams?.get("timezone")) return;
    if (typeof Intl === "undefined") return;
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTimeZone) return;
    const match = timeZoneOptions.find((option) => option.id === browserTimeZone);
    if (!match || match.id === timeZoneValue) return;
    const params = new URLSearchParams(searchParams?.toString());
    params.set("timezone", match.id);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
    router.refresh();
  }, [router, searchParams, timeZoneOptions, timeZoneValue]);

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
      <FormControl
        size="small"
        sx={{
          width: "100%",
          flex: 1,
          minWidth: 0,
        }}
      >
        <InputLabel id="timezone-select-label">Time zone</InputLabel>
        <Select
          labelId="timezone-select-label"
          label="Time zone"
          value={timeZoneValue}
          onChange={handleTimeZoneChange}
          MenuProps={{
            PaperProps: {
              sx: { bgcolor: "background.default" },
            },
          }}
        >
          {timeZoneOptions.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>
              {zone.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
