# Architecture

```text
Browser
  ├─ React orchestration (App)
  │    ├─ focused feature components
  │    ├─ deterministic domain plan
  │    └─ validated profile storage (localStorage only)
  ├─ GET /api/air-quality?city=…
  │    ├─ Open-Meteo geocoding
  │    └─ Open-Meteo / CAMS current + 24-hour forecast
  └─ POST /api/assistant
       └─ Gemini 3.5 Flash-Lite when GEMINI_API_KEY is configured

Verified AQI + household context
  └─ deterministic safety engine
       ├─ prioritized action plan
       ├─ exposure and emission estimates
       └─ guided assistant fallback
```

## Design decisions

- The safety engine is deterministic and independently tested. Generated text cannot change AQI thresholds or suppress urgent-care guidance.
- `App` coordinates state and services; feature components own rendering, while profile normalization and persistence are isolated in the data layer.
- Provider responses are normalized at the server boundary, keeping the UI independent from Open-Meteo's response shape.
- Normalized responses are validated again at the browser boundary, including nested forecast and pollutant values, before entering application state.
- The application labels Open-Meteo/CAMS readings as modeled conditions rather than nearby sensor measurements.
- The profile remains in browser storage. Only the minimum context required for an assistant question is sent to the assistant endpoint.
- The application remains useful if either external provider fails: current actions fall back to labelled demo data and assistant questions fall back to deterministic guidance.

## Data freshness

AQI responses are cached at the edge for 15 minutes with a 30-minute stale-while-revalidate window. This balances usefulness, resilience, and the provider's free-tier limits.

## Quality controls

- Strict TypeScript and ESLint run alongside 66 automated tests.
- Dependencies are pinned and installed from the committed lockfile for reproducible builds.
- The complete test, lint, and production-build gate is available through `npm run verify`.
