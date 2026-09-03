// Fake network latency for the Week 2 mock API (Route Handlers).
//
// Without a small delay, a Route Handler that just reads a static array responds
// almost instantly and `loading.tsx` never gets a chance to show — which defeats
// the point of learning it. Set `MOCK_API_DELAY_MS` in `.env.local` (e.g. 300) to
// make the loading state observable in dev; it defaults to 0 so tests/CI are fast.
//
// TODO Tuần 4+: remove this once the real Go backend is wired in.

const DEFAULT_MS = Number(process.env.MOCK_API_DELAY_MS ?? 0);

export function sleep(ms: number = DEFAULT_MS): Promise<void> {
  return ms > 0
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();
}
