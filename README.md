# Modern Snow

Modern Snow is a Next.js App Router app that turns NOAA Weather.gov gridpoint data into a visual snowfall outlook for major ski resorts across the Western US.

Live demo: https://modern-snow.vercel.app

## What It Does

- Pulls the latest NOAA gridpoint forecast for the selected resort.
- Normalizes each forecast window (snowfall, total precip, precip probability, temperature, wind, wind gusts, and cloud cover).
- Flags rain and high-wind windows, summarizing each alert with average chance/precip totals or peak gusts.
- Highlights bluebird windows when fresh powder clears without additional precip.
- Renders an interactive chart with snowfall bars, weather overlays, warning bands, and rich tooltips.
- Lets users pick a state, resort, and time zone (defaults to the browser time zone when available).

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
- `src/components/SnowForecast.tsx` — server component that loads NOAA data and streams the client chart
- `src/components/CustomChart.tsx` — client chart UI (warnings, bands, tooltip, chart config)
- `src/components/LocationMenu.tsx` — state, resort, and time zone selectors
- `src/data/getWeatherData.tsx` — server-side fetch + normalization of NOAA forecast data
- `src/data/forecastLocations.ts` — resort gridpoints grouped by state
- `src/data/timeZones.ts` — time zone options + resolver

## Data Source & Caching

The forecast is fetched from the NOAA Weather.gov gridpoint endpoint configured in `src/data/getWeatherData.tsx`.

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

## Configuring Locations and Time Zones

- Add or update resorts in `src/data/forecastLocations.ts`.
- Adjust the selectable time zones in `src/data/timeZones.ts`.
- Query params are supported: `?state=oregon&location=bachelor&timezone=America/Los_Angeles`.
