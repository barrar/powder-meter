# Repository Guidelines

## Project Structure & Module Organization
- Next.js 14 App Router lives in `src/app`; `layout.tsx` wires global styles, `page.tsx` renders the snow forecast shell, and `globals.css` holds Tailwind setup plus root colors.
- Reusable UI sits in `src/components`; mark interactive pieces with `'use client'` (e.g., `CustomChart.tsx` wraps Recharts).
- Data fetching and server actions belong in `src/data`; `getWeatherData.tsx` pulls NOAA snowfall data with a 10s revalidate window and the required user agent header.
- Keep feature-specific assets near their feature; prefer co-locating helpers beside the component that consumes them.

## Build, Test, and Development Commands
- `npm run dev` — start the local dev server at `http://localhost:3000`.
- `npm run build` — production build for CI or preview.
- `npm run start` — serve the built app.
- `npm run lint` — Next/ESLint checks; run before pushing to catch style and safety issues.

## Coding Style & Naming Conventions
- TypeScript-first; default to server components, add `'use client'` only when browser APIs or third-party client libs (Recharts) are needed.
- Components and React files use PascalCase filenames (`CustomChart.tsx`); helpers and server utilities use camelCase (`getWeatherData`).
- Favor concise functions, async/await for data access, and keep fetch headers/caching explicit.
- Use Tailwind utility classes for layout/styling; keep new global styles minimal and scoped through `globals.css` when necessary.
- Follow ESLint defaults (run `npm run lint`); keep imports ordered by origin (React/Next → third-party → local).

## Testing Guidelines
- No automated test harness is committed yet; when adding behavior, prefer colocated `.test.ts(x)` files using the tooling you introduce (Jest + React Testing Library are good defaults).
- For now, verify changes by running `npm run lint` and manually exercising `/` in dev; document manual steps in PRs.
- When testing data code, capture a fixture of the NOAA response to avoid network flakiness.