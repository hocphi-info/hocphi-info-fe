import { notFound } from "next/navigation";
import { API_BASE } from "@/lib/api-base";
import type {
  CoverageResponse,
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

// Every request goes through `apiFetch`: one place to add a per-attempt timeout
// and a small retry for *transient* upstream failures — a Fly machine waking
// from suspend, a 5xx, a dropped connection.
//
// 403 is in the retry set on purpose: hocphi-info-be has no auth at all (it is
// permanently read-only, see its AGENTS.md), so a 403 from it is never a real
// authorization failure — it's Fly's proxy returning one while it routes around
// a machine that is resuming. 404 stays out: that's a real "not found" the
// callers turn into notFound().
const RETRYABLE_STATUS = new Set([403, 408, 429, 500, 502, 503, 504]);

async function apiFetch(path: string): Promise<Response> {
  const url = `${API_BASE}${path}`;
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 10s/attempt: long enough for attempt 2-3 to catch a Fly machine cold
      // boot (~10-20s after scale-to-zero). A warm call returns in ~0.5s.
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok || !RETRYABLE_STATUS.has(res.status)) return res;
      lastError = new Error(`GET ${path} -> ${res.status}`);
    } catch (err) {
      lastError = err; // network error, or the 10s timeout aborted it
    }
    if (attempt < maxAttempts) {
      // 300ms, then 600ms
      await new Promise((r) => setTimeout(r, 300 * 2 ** (attempt - 1)));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`GET ${path} -> request failed`);
}

/** All rows for the "by major" screen (S1); /truong (S2) also uses this and
 * groups the rows client-side (see lib/filters.ts's deriveSchoolRows). */
export async function fetchMajorRows(): Promise<MajorRow[]> {
  const res = await apiFetch("/api/majors");
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
  const res = await apiFetch(`/api/schools/${schoolSlug}/majors/${majorSlug}`);
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(
      `GET /api/schools/${schoolSlug}/majors/${majorSlug} -> ${res.status}`,
    );
  }
  return res.json();
}

/** Biến thể của `fetchProgramDetail` cho trang so sánh (F8, Tuần 5): trả
 * `null` thay vì gọi `notFound()` khi lỗi/404. Khác trang F6 (1 mục lỗi = cả
 * trang 404), trang so sánh có thể có 2-3 mục — 1 mục lỗi không được làm
 * sập cả trang, các mục còn lại vẫn phải render được. */
export async function fetchProgramDetailSafe(
  schoolSlug: string,
  majorSlug: string,
): Promise<ProgramDetailResponse | null> {
  try {
    const res = await apiFetch(
      `/api/schools/${schoolSlug}/majors/${majorSlug}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Chi tiết 1 trường (F7) — hồ sơ + toàn bộ ngành đã có dữ liệu + Min-Max
 * theo hệ. 404 khi trường không tồn tại hoặc chưa có chương trình nào đã seed. */
export async function fetchSchoolDetail(
  schoolSlug: string,
): Promise<SchoolDetailResponse> {
  const res = await apiFetch(`/api/schools/${schoolSlug}`);
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`GET /api/schools/${schoolSlug} -> ${res.status}`);
  }
  return res.json();
}

/** Độ phủ dữ liệu cho trang F14 (`/du-lieu`) — số tổng hợp + độ phủ theo thành
 * phố / loại trường / nhóm ngành + bảng trạng thái từng trường.
 *
 * Khác mọi `fetch*` ở trên (không cache — tươi mỗi request): trang này là
 * meta-thông tin, chấp nhận trễ tối đa 1h. `next: { revalidate: 3600 }` cho Next
 * dựng lại HTML theo lịch — không phải deploy lại mỗi đợt seed, không đánh BE
 * mỗi lượt xem. Đây là chỗ đầu tiên trong app dùng ISR (learning note). */
export async function fetchCoverage(): Promise<CoverageResponse> {
  const res = await fetch(`${API_BASE}/api/coverage`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GET /api/coverage -> ${res.status}`);
  return res.json();
}
