import { API_BASE } from "@/lib/api-base";
import type { MajorRow, SchoolRow } from "@/types/domain";

// The frontend data layer. Week 1 read these straight from mock-data.ts; Week 2
// they go over HTTP. Same function names, same return types — so `page.tsx` only
// swaps `getMajorRows()` for `await fetchMajorRows()` and no component changes.
//
// Note: `fetch` in Next 16 is not cached by default and blocks rendering until it
// resolves. For a lookup site that wants fresh data every request, that default is
// exactly right — tuning caching is a later concern.
//
// `API_BASE` is a plain constant (see api-base.ts), so no `await` on it — the only
// `await` here is the HTTP call itself.

/** All rows for the "by major" screen (S1). */
export async function fetchMajorRows(): Promise<MajorRow[]> {
  const res = await fetch(`${API_BASE}/api/nganh`);
  // `fetch` does NOT throw on 404/500 — you have to check `res.ok` yourself.
  // Throwing here bubbles up to the nearest error.tsx.
  if (!res.ok) throw new Error(`GET /api/nganh -> ${res.status}`);
  return res.json();
}

/** All rows for the "by school" screen (S2). */
export async function fetchSchoolRows(): Promise<SchoolRow[]> {
  const res = await fetch(`${API_BASE}/api/truong`);
  if (!res.ok) throw new Error(`GET /api/truong -> ${res.status}`);
  return res.json();
}
