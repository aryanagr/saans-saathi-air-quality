# Saans Saathi — Urban Air Quality Assistant

Saans Saathi is a mobile-first assistant that turns local air quality and household context into a practical daily plan. It was created for the PromptWars **Urban Air Quality Assistant** vertical.

## Why this approach

Air-quality apps often stop at displaying a number. Saans Saathi answers the more useful question: **“What should my family do differently today, and why?”**

The MVP combines deterministic safety rules with contextual personalisation. AQI thresholds drive health-sensitive decisions, while household details adjust travel, indoor-air, cooking, and activity recommendations. This architecture intentionally keeps safety logic inspectable and testable instead of asking a language model to invent thresholds.

## Features

- US AQI classification with clear, non-colour-only status labels
- Household-aware advice for children, older adults, asthma, and pregnancy
- Contextual commute, indoor-air, ventilation, and cooking actions
- Direct impact explanation for every recommendation
- Interactive daily checklist and progress summary
- Illustrative exposure and emissions impact estimates with transparent caveats
- Key-free modeled current AQI search for any city through Open-Meteo, with a labelled demo fallback
- Live 24-hour modeled AQI outlook and cleanest practical daytime window
- Pollutant transparency for PM2.5, PM10, ozone, and the dominant pollutant
- Gemini-powered contextual Q&A with deterministic safety fallback
- Responsive UI with keyboard support, visible focus, semantic HTML, and reduced-motion support
- Unit and UI tests for decision logic and critical interactions

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite.

### Live city data

No API key or account is required. The server function uses Open-Meteo's geocoding and air-quality APIs, caches responses for 15 minutes, and falls back to illustrative readings when the provider is unavailable. The free service is intended for non-commercial use and requires attribution.

### Enable Gemini explanations

The assistant works without a key using deterministic guided answers. To enable Gemini 3.5 Flash-Lite explanations, create a free Google AI Studio key and add it only to the server environment:

```bash
GEMINI_API_KEY=your_key_here
```

The model explains verified context; it does not control safety thresholds or recommendation priority.

## Verify

```bash
npm test
npm run lint
npm run build
```

Latest production verification:

- 33 automated tests passing
- Lighthouse mobile: Performance 91, Accessibility 100, Best Practices 100, SEO 100
- Cumulative Layout Shift 0.001; Largest Contentful Paint 2.4 seconds
- Production city lookup and 24-hour forecast verified on Vercel

## How the logic works

1. A server-side function geocodes the selected city and requests modeled current US AQI from Open-Meteo; demo readings are the fallback.
2. `classifyAqi` maps the number to US EPA AQI bands.
3. `createAirPlan` combines the AQI band with household sensitivity, commute, purifier access, and cooking fuel.
4. Safety-critical recommendations are deterministic and covered by boundary tests.
5. The interface explains the direct benefit and urgency of each action.

The domain logic lives in `src/domain/airQuality.ts`, separate from React and data access. The server-side `api/air-quality.ts` function normalizes provider data before the browser receives it.

See [architecture](docs/ARCHITECTURE.md), [security and responsible AI](docs/SECURITY.md), and [evaluation mapping](docs/EVALUATION.md) for submission evidence.

## Assumptions and limitations

- The hourly chart is illustrative; the current reading is modeled data rather than a nearby regulatory sensor measurement.
- The app uses the US 0–500 AQI categories returned by Open-Meteo.
- Impact figures are illustrative educational estimates, not measurements.
- Advice is general environmental guidance and does not replace medical care.
- Profile data is stored only in the browser’s local storage.
- Current readings are cached for 15 minutes at the Vercel edge.

## Security and privacy

- No air-quality API secret is required or included in the browser bundle.
- City search text is sent to the app's server function and then to Open-Meteo Geocoding.
- No raw HTML is rendered from user input.
- Inputs use constrained native controls.
- Environment files are ignored; `.env.example` contains names only.
- Future GenAI output should be schema-validated and rendered as text, never trusted HTML.

## Accessibility

The app targets WCAG 2.2 AA with semantic landmarks, logical headings, persistent labels, native controls, keyboard-operable actions, visible focus, minimum touch targets, screen-reader status updates, text status alongside colour, and reduced-motion support.

## Suggested production architecture

```text
Browser UI → server API → AQI/weather provider
                     ↘ deterministic safety engine
                     ↘ optional GenAI explanation layer
```

The safety engine remains authoritative. If live data or the AI layer fails, the product should show the last verified reading with its timestamp and retain deterministic guidance.

## Repository rules

Keep the submission public, under 10 MB, and on one branch. Do not commit `node_modules`, build output, local environment files, or API keys.
