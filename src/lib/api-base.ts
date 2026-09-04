import { headers } from "next/headers";

// Base URL for our internal API calls.
//
// A `fetch` running inside a Server Component executes on the server, which has no
// implicit "current origin" like the browser does — so the URL must be absolute.
// Week 2: use NEXT_PUBLIC_API_URL if set, otherwise reconstruct the origin from the
// incoming request headers.
//
// When the Go backend lands (roadmap B4): set NEXT_PUBLIC_API_URL=http://localhost:8080
// in .env.local and every `fetch` in src/lib/api.ts points at it — no code change.
export async function apiBase(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const h = await headers(); // async in Next 16
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  // Node's fetch resolves "localhost" to IPv6 ::1 first, but the dev server only
  // listens on IPv4 — so a server-side fetch to http://localhost:3000 fails with
  // ECONNREFUSED. Force IPv4 for the loopback host.
  return `${proto}://${host}`.replace("//localhost:", "//127.0.0.1:");
}
