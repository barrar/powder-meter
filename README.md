# Powder Meter

Powder Meter is a Next.js App Router app that turns NOAA Weather.gov gridpoint data into a visual snowfall outlook for major ski resorts across the Western US.

Live demo: https://powdermeter.com

## What It Does

- Pulls the latest NOAA gridpoint forecast for the selected resort.
- Normalizes each forecast window (snowfall, total precip, precip probability, temperature, wind, wind gusts, and cloud cover).
- Flags rain and high-wind windows, summarizing each alert with average chance/precip totals or peak gusts.
- Highlights bluebird windows when fresh powder clears without additional precip.
- Renders an interactive chart with snowfall bars, weather overlays, warning bands, and rich tooltips.
- Lets users pick a state and resort, then formats time in the resort's local time zone.

## Tech Stack

- Next.js (App Router) + React
- TypeScript
- MUI (Material UI) for layout/styling
- Recharts for the forecast chart
- `dayjs` for time formatting
- `lucide-react` for alert icons

## Project Structure

- `src/app/layout.tsx` — global layout, theme wiring, and global styles
- `src/app/page.tsx` — landing page shell + suspense boundary for the forecast
- `src/app/_lib/forecastSelection.ts` — search-param parsing and forecast menu selection
- `src/components/SnowForecast.tsx` — server component that loads NOAA data and streams the client chart
- `src/components/chart/CustomChartClient.tsx` — client chart container and panel composition
- `src/components/chart/CustomChartPanels.tsx` — chart panels and rendering surface
- `src/components/location/LocationMenu.tsx` — state and resort selectors
- `src/data/getWeatherData.ts` — server-side fetch + normalization of NOAA forecast data
- `src/data/forecastLocations.ts` — resort gridpoints grouped by state
- `src/data/timeZones.ts` — supported resort time zones

## Data Source & Caching

The forecast is fetched from the NOAA Weather.gov gridpoint endpoint configured in `src/data/getWeatherData.ts`.

- Locations are defined in `src/data/forecastLocations.ts` as `{ office, x, y }` gridpoints.
- Weather.gov requests require a descriptive `User-Agent`; this project sets one in the request headers.
- Optional Redis caching is supported via `REDIS_ROSE_OCEAN_REDIS_URL` (TTL is 4 hours). Next.js fetch uses `cache: "no-store"` so Redis is the cache layer.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Useful Commands

```bash
npm run lint
npm run build
npm run start
```

## Configuring Locations

- Add or update resorts in `src/data/forecastLocations.ts`.
- Update the resort time zone mapping in `src/data/forecastLocations.ts` when adding new regions.
- Query params are supported: `?location=bachelor`.

## License

(c) 2026 Jeremiah Barrar. All rights reserved. No reproduction or distribution allowed.
