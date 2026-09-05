import { notFound } from "next/navigation";
import { API_BASE } from "@/lib/api-base";
import type {
  MajorRow,
  ProgramDetailResponse,
  SchoolDetailResponse,
} from "@/types/domain";

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

/** Chi tiết 1 ngành tại 1 trường (F6, S3). 404 (slug sai theo bất kỳ nghĩa
 * nào — trường không tồn tại, ngành không tồn tại, hoặc không khớp chương
 * trình nào) gọi `notFound()` ngay tại đây, khác `fetchMajorRows` — nên
 * page.tsx không cần tự kiểm tra trước khi render. */
export async function fetchProgramDetail(
  schoolSlug: string,
  majorSlug: string,
): Promise<ProgramDetailResponse> {
  const res = await fetch(
    `${API_BASE}/api/schools/${schoolSlug}/majors/${majorSlug}`,
  );
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(
      `GET /api/schools/${schoolSlug}/majors/${majorSlug} -> ${res.status}`,
    );
  }
  return res.json();
}

/** Chi tiết 1 trường (F7) — hồ sơ + toàn bộ ngành đã có dữ liệu + Min-Max
 * theo hệ. 404 khi trường không tồn tại hoặc chưa có chương trình nào đã seed. */
export async function fetchSchoolDetail(
  schoolSlug: string,
): Promise<SchoolDetailResponse> {
  const res = await fetch(`${API_BASE}/api/schools/${schoolSlug}`);
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`GET /api/schools/${schoolSlug} -> ${res.status}`);
  }
  return res.json();
}
