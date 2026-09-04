// Derived numbers, computed from raw data (never hard-coded).
//
// The backend schema deliberately stores only source numbers; totals, medians and
// min–max ranges are computed at query/render time (schema.md §1.3). These helpers
// live on the FE for Week 1 and will be reused unchanged in Week 2 when the raw
// data starts coming from the API instead of mock-data.ts.

import type { MajorRow, SchoolStats, Track } from "@/types/domain";

const DEFAULT_INCREASE_PCT = 10; // app_settings.default_increase_pct
const DEFAULT_COURSE_YEARS = 4; // app_settings.course_years_default

/**
 * Tổng học phí cả khoá, cộng dồn học phí từng năm với mức tăng luỹ tiến.
 * Năm 1 = year1Dong; năm k = năm (k-1) × (1 + pct/100).
 */
export function totalCourseCost(
  year1Dong: number,
  increasePct: number = DEFAULT_INCREASE_PCT,
  years: number = DEFAULT_COURSE_YEARS,
): number {
  let yearAmount = year1Dong;
  let total = year1Dong;
  for (let k = 2; k <= years; k++) {
    yearAmount = yearAmount * (1 + increasePct / 100);
    total += yearAmount;
  }
  return Math.round(total);
}

function median(sortedAsc: number[]): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0
    ? (sortedAsc[mid - 1] + sortedAsc[mid]) / 2
    : sortedAsc[mid];
}

/**
 * Thống kê học phí năm đầu cho các ngành của một trường, tính trong phạm vi
 * `tracks` (mặc định chỉ hệ đại trà — giữ nguyên hành vi Tuần 1/2).
 * `rows` là các MajorRow đã lọc sẵn về một trường (mọi track); hàm này tự bỏ
 * các track ngoài `tracks` — không bao giờ trộn hệ vào một phép min/median/max.
 *
 * Week 3: `tracks` cho phép S2 đổi "cơ sở tính khoảng" (chỉ đại trà ↔ gồm CLC).
 */
export function schoolTuitionStats(
  rows: MajorRow[],
  tracks: Track[] = ["dai_tra"],
): SchoolStats {
  const scoped = rows.filter((r) => tracks.includes(r.program.track));

  const byAmount = [...scoped].sort(
    (a, b) => a.year1.amountPerYear - b.year1.amountPerYear,
  );
  const amounts = byAmount.map((r) => r.year1.amountPerYear);

  const cheapest = byAmount.at(0);
  const priciest = byAmount.at(-1);

  const increasePcts = scoped
    .map((r) => r.increase?.annualIncreasePct)
    .filter((p): p is number => p != null);
  const increaseSources = new Set(
    scoped.map((r) => r.increase?.increaseSource).filter(Boolean),
  );
  const increaseSummary =
    increasePcts.length === 0
      ? "—"
      : increaseSources.size > 1
        ? "hỗn hợp"
        : increasePcts.length === 1 ||
            Math.min(...increasePcts) === Math.max(...increasePcts)
          ? `+${increasePcts[0]}%`
          : `+${Math.min(...increasePcts)}–${Math.max(...increasePcts)}%`;

  return {
    nPrograms: scoped.length,
    minAmount: cheapest?.year1.amountPerYear ?? 0,
    minMajorName: cheapest?.major.name ?? "",
    medianAmount: median(amounts),
    maxAmount: priciest?.year1.amountPerYear ?? 0,
    maxMajorName: priciest?.major.name ?? "",
    increaseSummary,
  };
}
