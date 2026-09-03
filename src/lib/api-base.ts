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
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
