import { NextResponse } from "next/server";

import { getMajorRows } from "@/lib/mock-data";
import { sleep } from "@/lib/sleep";

// Route Handler = an HTTP endpoint that lives inside the app router. The file is
// named `route.ts` and each export is named after an HTTP method. It runs on the
// server, so it can import server-only data (`mock-data.ts`) directly.
//
// Week 2 stand-in for the real Go backend: it just wraps the Week 1 join helper
// in JSON. When the backend exists, set NEXT_PUBLIC_API_URL and this handler is
// bypassed — the frontend `fetch` in src/lib/api.ts points straight at it.
export async function GET() {
  await sleep(); // fake latency so loading.tsx is visible (no-op unless MOCK_API_DELAY_MS is set)
  return NextResponse.json(getMajorRows());
}
