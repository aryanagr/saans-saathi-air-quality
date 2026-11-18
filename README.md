# Saans Saathi — Urban Air Quality Assistant

Saans Saathi is a mobile-first assistant that turns local air quality and household context into a practical daily plan. It was created for the PromptWars **Urban Air Quality Assistant** vertical.

## Why this approach

Air-quality apps often stop at displaying a number. Saans Saathi answers the more useful question: **“What should my family do differently today, and why?”**

The MVP combines deterministic safety rules with contextual personalisation. AQI thresholds drive health-sensitive decisions, while household details adjust travel, indoor-air, cooking, and activity recommendations. This architecture intentionally keeps safety logic inspectable and testable instead of asking a language model to invent thresholds.

## Features

- India AQI classification with clear, non-colour-only status labels
- Household-aware advice for children, older adults, asthma, and pregnancy
- Contextual commute, indoor-air, ventilation, and cooking actions
- Direct impact explanation for every recommendation
- Interactive daily checklist and progress summary
- Illustrative exposure and emissions impact estimates with transparent caveats
- Live current AQI search for any city through Google APIs, with a labelled demo fallback
- Responsive UI with keyboard support, visible focus, semantic HTML, and reduced-motion support
- Unit and UI tests for decision logic and critical interactions

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite.

### Enable live city data

In Google Cloud, enable **Geocoding API** and **Air Quality API**, then add this server-only environment variable locally and in the Vercel project:

```bash
GOOGLE_MAPS_API_KEY=your_key_here
```

Do not prefix the key with `VITE_`; that would expose it in the browser. Restrict the key to only the two required Google APIs and configure quota alerts. If the key, quota, or provider is unavailable, the interface explicitly falls back to illustrative readings.

## Verify

```bash
npm test
npm run lint
npm run build
```

## How the logic works

1. A server-side function geocodes the selected city and requests current AQI from Google; verified demo readings are the fallback.
2. `classifyAqi` maps the number to India AQI bands.
3. `createAirPlan` combines the AQI band with household sensitivity, commute, purifier access, and cooking fuel.
4. Safety-critical recommendations are deterministic and covered by boundary tests.
5. The interface explains the direct benefit and urgency of each action.

The domain logic lives in `src/domain/airQuality.ts`, separate from React and data access. The provider key remains in the server-side `api/air-quality.ts` function, while the browser receives only a normalized reading.

## Assumptions and limitations

- The hourly forecast is illustrative; current AQI is live when the Google integration is configured.
- The app uses India’s 0–500 AQI categories.
- Impact figures are illustrative educational estimates, not measurements.
- Advice is general environmental guidance and does not replace medical care.
- Profile data is stored only in the browser’s local storage.
- Current readings are cached briefly at the Vercel edge; production quotas should also be limited and monitored in Google Cloud.

## Security and privacy

- The Google API key is server-only and never included in the browser bundle.
- City search text is sent to the app's server function and then to Google Geocoding.
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
