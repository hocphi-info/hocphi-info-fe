// Hàm thuần (không import React) cho trang so sánh (F8) — cùng "hình dạng"
// với lib/derive.ts và lib/filters.ts: chạy được cả trên server (page.tsx)
// lẫn client, dễ test độc lập.
//
// `/so-sanh` có thể vào thẳng bằng URL dán/chia sẻ, không chỉ qua /nganh, nên
// mọi hàm ở đây phải xử lý mềm dữ liệu "bẩn": id trùng lặp, id không tồn tại,
// nhiều hơn 3 id trong URL — không throw, không crash trang.

import type { MajorRow, Track } from "@/types/domain";
import { type ParamsInput, getAll } from "@/lib/filters";

/** Query key dùng cho danh sách so sánh — dùng chung với useCompareSelection. */
export const COMPARE_KEY = "item";
export const MAX_COMPARE = 3;
const KEY = COMPARE_KEY;

/** Đọc `item` từ URL/searchParams: khử trùng lặp, cắt còn tối đa 3. */
export function parseCompareIds(sp: ParamsInput): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const id of getAll(sp, KEY)) {
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= MAX_COMPARE) break;
  }
  return ids;
}

/** 1 mục đã resolve được từ `Program.id` sang cặp slug để gọi
 * `fetchProgramDetail` — `Program.id` không tự fetch chi tiết được (không có
 * `GET /api/programs/{id}`), phải tra qua `fetchMajorRows()`. */
export interface ResolvedCompareRef {
  id: string;
  schoolSlug: string;
  majorSlug: string;
  track: Track;
  label: string;
}

/**
 * Lọc bỏ id không còn tồn tại trong `majorRows` TRƯỚC KHI gọi chi tiết —
 * không để lọt xuống bước fetch (id không tồn tại có thể là chương trình đã
 * bị xoá khỏi seed sau khi link so sánh được tạo/chia sẻ).
 */
export function resolveCompareItems(
  ids: string[],
  majorRows: MajorRow[],
): { resolved: ResolvedCompareRef[]; missingIds: string[] } {
  const byId = new Map(majorRows.map((r) => [r.program.id, r]));
  const resolved: ResolvedCompareRef[] = [];
  const missingIds: string[] = [];

  for (const id of ids) {
    const row = byId.get(id);
    if (!row) {
      missingIds.push(id);
      continue;
    }
    resolved.push({
      id,
      schoolSlug: row.school.slug,
      majorSlug: row.major.slug,
      track: row.program.track,
      label: `${row.major.name} — ${row.school.shortName}`,
    });
  }
  return { resolved, missingIds };
}

/** R4: banner cảnh báo khi các mục đang so sánh không cùng hệ đào tạo. */
export function hasTrackMismatch(items: { track: Track }[]): boolean {
  return new Set(items.map((i) => i.track)).size > 1;
}

/** Query string mang đúng `item=...` hiện tại — dùng để build link sang
 * `/so-sanh` (CompareCountButton/CompareTray) hoặc quay lại `/nganh` (R7) mà
 * không mất lựa chọn đang có. Hàm thuần (không "use client") nên gọi được cả
 * từ Server Component. */
export function compareParamsFrom(ids: string[]): string {
  const p = new URLSearchParams();
  ids.forEach((id) => p.append(KEY, id));
  return p.toString();
}
