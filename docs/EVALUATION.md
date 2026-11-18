# Evaluation mapping

| Criterion | Evidence |
|---|---|
| Problem alignment | Location- and household-aware exposure, indoor-air, commute, cooking, and activity decisions |
| Smart assistance | Gemini explanation layer grounded in verified context, plus deterministic fallback |
| Logical decision-making | Tested AQI thresholds and sensitivity-, commute-, purifier-, and fuel-aware rules |
| Practical usability | Any-city search, WHO pollutant references, cleanest daytime window, checklist, direct impact |
| Code quality | Separate provider, domain, UI, and assistant modules; strict TypeScript and linting |
| Security | Server-only secret, bounded inputs, fixed outbound origins, timeouts, safe text rendering |
| Efficiency | 15-minute edge caching, debounced city lookup, compressed 42 KB hero image, no heavy AI SDK |
| Testing | Boundary, malformed-response, recommendation, provider-normalization, assistant-fallback, and UI interaction tests |
| Accessibility | Semantic landmarks, labelled fields, focus management, keyboard dialog, live regions, reduced motion |
| Resilience | Explicit loading/error/live states, demo AQI fallback, guided assistant fallback |

## Verified quality snapshot

- Lighthouse mobile: Performance 91, Accessibility 100, Best Practices 100, SEO 100
- Core loading metrics: LCP 2.4 s and CLS 0.001
- 62 automated tests across 10 test files
- Clean lint, strict TypeScript build, and production API smoke test

## Demonstration scenarios

1. **Sensitive family in New Delhi:** child profile, public transport, gas cooking, purifier available.
2. **Cyclist in Bengaluru:** compare the travel recommendation at cleaner and unhealthy AQI levels.
3. **Any global city:** enter a new city and observe normalized current conditions and hourly outlook.
4. **Provider failure:** the interface labels fallback data instead of presenting it as live.
5. **AI unavailable:** ask a quick question and receive a deterministic guided answer with its mode clearly disclosed.
