// Base URL for our API calls, read once at module load — not per request.
//
// A `fetch` inside a Server Component runs on the server, which has no implicit
// "current origin" like the browser, so the URL must be absolute. We get that
// origin from NEXT_PUBLIC_API_URL, which every environment sets:
//   - .env.local      -> http://127.0.0.1:3000  (dev server serves the Route Handlers)
//   - .env.production  -> the real API domain
// When the Go backend lands (roadmap B4), only that value changes — no code here.
//
// Because it's a plain constant, callers use `API_BASE` directly with no `await`.
// A missing value is a config error we want to fail loudly on at startup.
const raw = process.env.NEXT_PUBLIC_API_URL;
if (!raw) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local (see src/lib/api-base.ts).",
  );
}

export const API_BASE = raw.replace(/\/$/, "");
