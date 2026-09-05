import { API_BASE } from "@/lib/api-base";
import type { MajorRow } from "@/types/domain";

// The frontend data layer. Week 1 read these straight from mock-data.ts; Week 2
// they went over HTTP to this app's own mock Route Handlers; now they call the
// real hocphi-info-be (FastAPI) directly. Same function name, same return type
// throughout — so `page.tsx` and every component were never touched.
//
// Note: `fetch` in Next 16 is not cached by default and blocks rendering until it
// resolves. For a lookup site that wants fresh data every request, that default is
// exactly right — tuning caching is a later concern.
//
// `API_BASE` is a plain constant (see api-base.ts), so no `await` on it — the only
// `await` here is the HTTP call itself.

/** All rows for the "by major" screen (S1); /truong (S2) also uses this and
 * groups the rows client-side (see lib/filters.ts's deriveSchoolRows). */
export async function fetchMajorRows(): Promise<MajorRow[]> {
  const res = await fetch(`${API_BASE}/api/majors`);
  // `fetch` does NOT throw on 404/500 — you have to check `res.ok` yourself.
  // Throwing here bubbles up to the nearest error.tsx.
  if (!res.ok) throw new Error(`GET /api/majors -> ${res.status}`);
  return res.json();
}
