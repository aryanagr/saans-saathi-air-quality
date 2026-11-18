# Security and responsible AI

## Trust boundaries

- City names and assistant questions are untrusted input.
- Open-Meteo and Gemini responses are untrusted external data.
- Browser state is never treated as an authorization boundary.

## Controls

- City input uses an allowlist pattern, whitespace normalization, and an 80-character limit.
- Assistant questions are limited to 500 characters and request bodies to 8 KB.
- External requests have strict timeouts and fixed provider origins, preventing user-controlled SSRF destinations.
- Provider errors are normalized; secrets, stack traces, and raw internal errors are not returned to users.
- `GEMINI_API_KEY` is read only by the Vercel function and is never included in the client bundle.
- Gemini receives a bounded JSON context and explicit instructions to treat it as data, resist embedded instructions, avoid diagnosis, and preserve emergency escalation guidance.
- Generated output is rendered as React text, never as raw HTML.
- The deterministic safety engine remains authoritative when Gemini is unavailable or produces no usable response.

## Privacy

The household profile is stored in local storage. Assistant requests send the selected city, AQI context, and household settings to the app server and Gemini only when a question is submitted. The application has no accounts, advertising trackers, or user database.

## Residual risks

- Model output can still be incomplete or inaccurate; the UI identifies whether an answer came from Gemini or deterministic guidance.
- Open-Meteo is modeled data and may differ from local monitoring stations.
- Production abuse protection should add a shared rate limiter if public assistant traffic grows beyond competition-demo volume.
