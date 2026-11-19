# Security and responsible AI

## Trust boundaries

- City names and assistant questions are untrusted input.
- Open-Meteo and Gemini responses are untrusted external data.
- Browser state is never treated as an authorization boundary.

## Controls

- City input uses an allowlist pattern, whitespace normalization, and an 80-character limit.
- Assistant questions are limited to 500 characters and request bodies to 8 KB.
- Assistant requests require JSON, reject oversized declared bodies before reading them, and are throttled to 10 requests per client per minute on each warm function instance.
- Client-supplied assistant context is reduced to an explicit allowlist of bounded air-quality and household fields before it reaches Gemini; enum-like values are validated and the AQI category is derived server-side.
- External requests have strict timeouts and fixed provider origins, preventing user-controlled SSRF destinations.
- Provider errors are normalized; secrets, stack traces, and raw internal errors are not returned to users.
- `GEMINI_API_KEY` is read only by the Vercel function and is never included in the client bundle.
- Gemini receives a bounded JSON context and explicit instructions to treat it as data, resist embedded instructions, avoid diagnosis, and preserve emergency escalation guidance.
- Generated output is rendered as React text, never as raw HTML.
- API responses disable MIME sniffing; assistant responses are non-cacheable and bounded in length.
- Vercel applies a restrictive Content Security Policy to every route: scripts, styles, fonts, connections, and base URLs are limited to this application; plug-in content and third-party framing are blocked.
- Deployment headers prevent MIME sniffing and clickjacking, limit cross-origin opener/resource access and referrer detail, and disable unused camera, microphone, geolocation, payment, and USB capabilities.
- The deterministic safety engine remains authoritative when Gemini is unavailable or produces no usable response.

## Privacy

The household profile is stored in local storage. Assistant requests send the selected city, AQI context, and household settings to the app server and Gemini only when a question is submitted. The application has no accounts, advertising trackers, or user database.

## Residual risks

- Model output can still be incomplete or inaccurate; the UI identifies whether an answer came from Gemini or deterministic guidance.
- Open-Meteo is modeled data and may differ from local monitoring stations.
- The in-memory assistant throttle is best-effort per warm serverless instance. Sustained production traffic should use Vercel Firewall rate limiting or a shared durable limiter.
