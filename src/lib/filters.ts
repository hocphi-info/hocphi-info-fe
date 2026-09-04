// The heart of Week 3: filter + sort state lives in the URL query string, not in
// React state. These are PURE functions — no React import — so the exact same
// code runs on the server (page.tsx first render, for correct SSR HTML) and on
// the client (every filter change after that). One logic, one place: if the two
// sides disagreed, SSR and hydration would mismatch.
//
// Learning note (vs Flutter): there's no direct equivalent. The closest is
// pulling business logic out of a Widget into a plain Dart function so it's
// testable — here we pull it out so BOTH runtimes can call it.
//
// Query string design: repeated keys (`?city=HCM&city=HN`), not CSV. Reason:
// URLSearchParams.getAll() handles it natively, and Next's `searchParams` page
// prop already returns an array when a key repeats. Default values are NEVER
// written to the URL — a clean `/nganh` means "no filters, default sort", and
// "reset" is just "delete every param".

import type {
  CityCode,
  MajorGroupCode,
  MajorRow,
  SchoolCategory,
  SchoolRow,
  Track,
} from "@/types/domain";
import { schoolTuitionStats, totalCourseCost } from "@/lib/derive";

// --- Allowed values (used to reject junk query params defensively) ----------

const CITY_CODES: CityCode[] = ["HCM", "HN"];
const GROUP_CODES: MajorGroupCode[] = [
  "CNTT",
  "KY_THUAT",
  "KINH_TE",
  "Y_DUOC",
  "LUAT",
  "LOGISTICS",
];
const CATEGORIES: SchoolCategory[] = [
  "cong_lap",
  "cong_lap_tu_chu",
  "tu_thuc",
  "tu_thuc_von_nuoc_ngoai",
];
const TRACKS: Track[] = ["dai_tra", "chat_luong_cao", "tien_tien", "quoc_te"];

/** Tracks counted when the S2 "cơ sở tính khoảng" radio is set to "gồm cả CLC". */
export const BASIS_ALL_TRACKS: Track[] = [
  "dai_tra",
  "chat_luong_cao",
  "tien_tien",
];

// --- Human labels (for the "bộ lọc đang áp" description + mobile chips) ------

const CITY_LABELS: Record<CityCode, string> = { HCM: "TP.HCM", HN: "Hà Nội" };
const GROUP_LABELS: Record<MajorGroupCode, string> = {
  CNTT: "CNTT / KHMT",
  KY_THUAT: "Kỹ thuật",
  KINH_TE: "Kinh tế",
  Y_DUOC: "Y – Dược",
  LUAT: "Luật",
  LOGISTICS: "Logistics",
};
const CATEGORY_LABELS: Record<SchoolCategory, string> = {
  cong_lap: "Công lập",
  cong_lap_tu_chu: "Công lập tự chủ",
  tu_thuc: "Tư thục",
  tu_thuc_von_nuoc_ngoai: "Tư thục · vốn nước ngoài",
};
const TRACK_LABELS: Record<Track, string> = {
  dai_tra: "đại trà",
  chat_luong_cao: "chất lượng cao",
  tien_tien: "tiên tiến",
  quoc_te: "quốc tế",
};

// --- Sort ------------------------------------------------------------------

export type MajorSortKey = "year1" | "total" | "increase" | "name";
export type SchoolSortKey = "min" | "median" | "max" | "name";
export type SortDir = "asc" | "desc";

const MAJOR_SORT_KEYS: MajorSortKey[] = ["year1", "total", "increase", "name"];
const SCHOOL_SORT_KEYS: SchoolSortKey[] = ["min", "median", "max", "name"];

export const MAJOR_SORT_LABELS: Record<MajorSortKey, string> = {
  year1: "Học phí năm đầu",
  total: "Tổng cả khoá",
  increase: "Tốc độ tăng",
  name: "Tên trường (A–Z)",
};
export const SCHOOL_SORT_LABELS: Record<SchoolSortKey, string> = {
  min: "Học phí thấp nhất",
  median: "Trung vị",
  max: "Học phí cao nhất",
  name: "Tên trường (A–Z)",
};

// --- Filter shapes ------------------------------------------------------------

export interface MajorFilters {
  cities: CityCode[];
  groups: MajorGroupCode[];
  tracks: Track[];
  categories: SchoolCategory[];
  /** Max năm-đầu tuition in triệu đồng/năm; null = no cap. */
  maxMillions: number | null;
  /** "Chỉ trường công bố lộ trình tăng". */
  roadmapOnly: boolean;
  sort: MajorSortKey;
  dir: SortDir;
}

export interface SchoolFilters {
  cities: CityCode[];
  /** "Có đào tạo nhóm ngành" — school has ≥1 program in one of these groups. */
  groups: MajorGroupCode[];
  categories: SchoolCategory[];
  /** Max "học phí thấp nhất" in triệu đồng/năm; null = no cap. */
  maxMillions: number | null;
  /** Tracks the min/median/max range is computed over ("cơ sở tính khoảng"). */
  basisTracks: Track[];
  sort: SchoolSortKey;
  dir: SortDir;
}

/** Accepts a real URLSearchParams OR the page's `searchParams` prop object. */
type ParamsInput =
  URLSearchParams | Record<string, string | string[] | undefined>;

function getAll(sp: ParamsInput, key: string): string[] {
  if (sp instanceof URLSearchParams) return sp.getAll(key);
  const v = sp[key];
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function getOne(sp: ParamsInput, key: string): string | null {
  return getAll(sp, key)[0] ?? null;
}

/** Keep only values that are in `allowed` — silently drops junk. */
function clean<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((v): v is T =>
    (allowed as readonly string[]).includes(v),
  );
}

function parseMax(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// --- Parse -----------------------------------------------------------------

export function parseMajorFilters(sp: ParamsInput): MajorFilters {
  return {
    cities: clean(getAll(sp, "city"), CITY_CODES),
    groups: clean(getAll(sp, "group"), GROUP_CODES),
    tracks: clean(getAll(sp, "track"), TRACKS),
    categories: clean(getAll(sp, "cat"), CATEGORIES),
    maxMillions: parseMax(getOne(sp, "max")),
    roadmapOnly: getOne(sp, "roadmap") === "1",
    sort: clean([getOne(sp, "sort") ?? ""], MAJOR_SORT_KEYS)[0] ?? "year1",
    dir: getOne(sp, "dir") === "desc" ? "desc" : "asc",
  };
}

export function parseSchoolFilters(sp: ParamsInput): SchoolFilters {
  return {
    cities: clean(getAll(sp, "city"), CITY_CODES),
    groups: clean(getAll(sp, "group"), GROUP_CODES),
    categories: clean(getAll(sp, "cat"), CATEGORIES),
    maxMillions: parseMax(getOne(sp, "max")),
    basisTracks: getOne(sp, "basis") === "all" ? BASIS_ALL_TRACKS : ["dai_tra"],
    sort: clean([getOne(sp, "sort") ?? ""], SCHOOL_SORT_KEYS)[0] ?? "min",
    dir: getOne(sp, "dir") === "desc" ? "desc" : "asc",
  };
}

// --- Serialize (filters -> URLSearchParams, defaults omitted) --------------

export function serializeMajorFilters(f: MajorFilters): URLSearchParams {
  const p = new URLSearchParams();
  f.cities.forEach((v) => p.append("city", v));
  f.groups.forEach((v) => p.append("group", v));
  f.tracks.forEach((v) => p.append("track", v));
  f.categories.forEach((v) => p.append("cat", v));
  if (f.maxMillions != null) p.set("max", String(f.maxMillions));
  if (f.roadmapOnly) p.set("roadmap", "1");
  if (f.sort !== "year1") p.set("sort", f.sort);
  if (f.dir !== "asc") p.set("dir", f.dir);
  return p;
}

export function serializeSchoolFilters(f: SchoolFilters): URLSearchParams {
  const p = new URLSearchParams();
  f.cities.forEach((v) => p.append("city", v));
  f.groups.forEach((v) => p.append("group", v));
  f.categories.forEach((v) => p.append("cat", v));
  if (f.maxMillions != null) p.set("max", String(f.maxMillions));
  if (f.basisTracks.length > 1) p.set("basis", "all");
  if (f.sort !== "min") p.set("sort", f.sort);
  if (f.dir !== "asc") p.set("dir", f.dir);
  return p;
}

// --- Filter --------------------------------------------------------------

const MILLION = 1_000_000;

export function filterMajorRows(rows: MajorRow[], f: MajorFilters): MajorRow[] {
  return rows.filter((r) => {
    if (f.cities.length && !f.cities.includes(r.school.cityCode)) return false;
    if (f.groups.length && !f.groups.includes(r.major.groupCode)) return false;
    if (f.tracks.length && !f.tracks.includes(r.program.track)) return false;
    if (f.categories.length && !f.categories.includes(r.school.category))
      return false;
    if (
      f.maxMillions != null &&
      r.year1.amountPerYear > f.maxMillions * MILLION
    )
      return false;
    if (f.roadmapOnly && r.increase?.increaseSource !== "published_roadmap")
      return false;
    return true;
  });
}

/**
 * Group MajorRow[] into SchoolRow[] on the client, so the S2 "cơ sở tính khoảng"
 * radio (R6) and "có đào tạo nhóm ngành" filter can actually work — SchoolRow
 * from the API has pre-baked stats with no per-program data to recompute from.
 *
 * `groups` filter is applied to the WHOLE school (does it teach any of these?),
 * not to the range calculation, per spec S2.
 */
export function deriveSchoolRows(
  rows: MajorRow[],
  basisTracks: Track[],
): SchoolRow[] {
  const bySlug = new Map<string, MajorRow[]>();
  for (const r of rows) {
    const list = bySlug.get(r.school.slug);
    if (list) list.push(r);
    else bySlug.set(r.school.slug, [r]);
  }

  const out: SchoolRow[] = [];
  for (const [, schoolRows] of bySlug) {
    const stats = schoolTuitionStats(schoolRows, basisTracks);
    if (stats.nPrograms === 0) continue; // no program in the chosen tracks
    out.push({ school: schoolRows[0].school, stats });
  }
  return out;
}

export function filterSchoolRows(
  schoolRows: SchoolRow[],
  allMajorRows: MajorRow[],
  f: SchoolFilters,
): SchoolRow[] {
  // Which schools teach at least one program in the selected groups.
  const groupsBySchool = new Map<string, Set<MajorGroupCode>>();
  if (f.groups.length) {
    for (const r of allMajorRows) {
      const set = groupsBySchool.get(r.school.slug) ?? new Set();
      set.add(r.major.groupCode);
      groupsBySchool.set(r.school.slug, set);
    }
  }

  return schoolRows.filter(({ school, stats }) => {
    if (f.cities.length && !f.cities.includes(school.cityCode)) return false;
    if (f.categories.length && !f.categories.includes(school.category))
      return false;
    if (f.maxMillions != null && stats.minAmount > f.maxMillions * MILLION)
      return false;
    if (f.groups.length) {
      const taught = groupsBySchool.get(school.slug);
      if (!taught || !f.groups.some((g) => taught.has(g))) return false;
    }
    return true;
  });
}

// --- Sort (never mutates the input array) ---------------------------------

export function sortMajorRows(rows: MajorRow[], f: MajorFilters): MajorRow[] {
  const sign = f.dir === "asc" ? 1 : -1;
  const value = (r: MajorRow): number | string => {
    switch (f.sort) {
      case "year1":
        return r.year1.amountPerYear;
      case "total":
        return totalCourseCost(
          r.year1.amountPerYear,
          r.increase?.annualIncreasePct,
        );
      case "increase":
        // rows with no published increase sort last regardless of direction
        return (
          r.increase?.annualIncreasePct ??
          (f.dir === "asc" ? Infinity : -Infinity)
        );
      case "name":
        return r.school.name;
    }
  };
  return [...rows].sort((a, b) => {
    const av = value(a);
    const bv = value(b);
    if (typeof av === "string" && typeof bv === "string")
      return sign * av.localeCompare(bv, "vi");
    return sign * ((av as number) - (bv as number));
  });
}

export function sortSchoolRows(
  rows: SchoolRow[],
  f: SchoolFilters,
): SchoolRow[] {
  const sign = f.dir === "asc" ? 1 : -1;
  const value = (r: SchoolRow): number | string => {
    switch (f.sort) {
      case "min":
        return r.stats.minAmount;
      case "median":
        return r.stats.medianAmount;
      case "max":
        return r.stats.maxAmount;
      case "name":
        return r.school.name;
    }
  };
  return [...rows].sort((a, b) => {
    const av = value(a);
    const bv = value(b);
    if (typeof av === "string" && typeof bv === "string")
      return sign * av.localeCompare(bv, "vi");
    return sign * ((av as number) - (bv as number));
  });
}

// --- Describe (for the "bộ lọc đang áp" line + mobile chips) --------------

function joinLabels<T extends string>(
  values: T[],
  labels: Record<T, string>,
): string {
  return values.map((v) => labels[v]).join(", ");
}

/** One-line summary: "Thành phố: TP.HCM · Nhóm ngành: CNTT / KHMT · Hệ: đại trà". */
export function describeMajorFilters(f: MajorFilters): string {
  const parts: string[] = [];
  if (f.cities.length)
    parts.push(`Thành phố: ${joinLabels(f.cities, CITY_LABELS)}`);
  if (f.groups.length)
    parts.push(`Nhóm ngành: ${joinLabels(f.groups, GROUP_LABELS)}`);
  if (f.tracks.length) parts.push(`Hệ: ${joinLabels(f.tracks, TRACK_LABELS)}`);
  if (f.categories.length)
    parts.push(`Loại trường: ${joinLabels(f.categories, CATEGORY_LABELS)}`);
  if (f.maxMillions != null) parts.push(`Học phí ≤ ${f.maxMillions} tr/năm`);
  if (f.roadmapOnly) parts.push("chỉ trường công bố lộ trình");
  return parts.length ? parts.join(" · ") : "Bộ lọc: tất cả";
}

export function describeSchoolFilters(f: SchoolFilters): string {
  const parts: string[] = [];
  if (f.cities.length)
    parts.push(`Thành phố: ${joinLabels(f.cities, CITY_LABELS)}`);
  if (f.groups.length)
    parts.push(`Có đào tạo: ${joinLabels(f.groups, GROUP_LABELS)}`);
  if (f.categories.length)
    parts.push(`Loại trường: ${joinLabels(f.categories, CATEGORY_LABELS)}`);
  if (f.maxMillions != null)
    parts.push(`Học phí thấp nhất ≤ ${f.maxMillions} tr/năm`);
  if (f.basisTracks.length > 1) parts.push("khoảng gồm cả CLC – tiên tiến");
  return parts.length ? parts.join(" · ") : "Bộ lọc: tất cả";
}

// --- Chips (mobile) — each chip knows how to remove itself from the URL ---

export interface FilterChip {
  label: string;
  /** Query key to edit when the chip's X is clicked. */
  param: string;
  /** For repeated-key params: the specific value to remove. Omit to delete key. */
  value?: string;
}

export function majorFilterChips(f: MajorFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  f.cities.forEach((v) =>
    chips.push({ label: CITY_LABELS[v], param: "city", value: v }),
  );
  f.groups.forEach((v) =>
    chips.push({ label: GROUP_LABELS[v], param: "group", value: v }),
  );
  f.tracks.forEach((v) =>
    chips.push({ label: TRACK_LABELS[v], param: "track", value: v }),
  );
  f.categories.forEach((v) =>
    chips.push({ label: CATEGORY_LABELS[v], param: "cat", value: v }),
  );
  if (f.maxMillions != null)
    chips.push({ label: `≤ ${f.maxMillions} tr`, param: "max" });
  if (f.roadmapOnly)
    chips.push({ label: "Có lộ trình tăng", param: "roadmap" });
  return chips;
}

export function schoolFilterChips(f: SchoolFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  f.cities.forEach((v) =>
    chips.push({ label: CITY_LABELS[v], param: "city", value: v }),
  );
  f.groups.forEach((v) =>
    chips.push({ label: GROUP_LABELS[v], param: "group", value: v }),
  );
  f.categories.forEach((v) =>
    chips.push({ label: CATEGORY_LABELS[v], param: "cat", value: v }),
  );
  if (f.maxMillions != null)
    chips.push({ label: `≤ ${f.maxMillions} tr`, param: "max" });
  if (f.basisTracks.length > 1)
    chips.push({ label: "Gồm CLC – tiên tiến", param: "basis" });
  return chips;
}

// --- F5: carry compatible filters when switching /nganh <-> /truong ------

/** /nganh URL params -> /truong URL params (drop track, roadmap, S1-only sorts). */
export function majorParamsToSchool(sp: ParamsInput): URLSearchParams {
  const f = parseMajorFilters(sp);
  const school: SchoolFilters = {
    cities: f.cities,
    groups: f.groups, // reinterpreted as "có đào tạo nhóm ngành"
    categories: f.categories,
    maxMillions: f.maxMillions,
    basisTracks: ["dai_tra"],
    sort: f.sort === "name" ? "name" : "min",
    dir: f.sort === "name" ? f.dir : "asc",
  };
  return serializeSchoolFilters(school);
}

/** /truong URL params -> /nganh URL params (drop basis, S2-only sorts). */
export function schoolParamsToMajor(sp: ParamsInput): URLSearchParams {
  const f = parseSchoolFilters(sp);
  const major: MajorFilters = {
    cities: f.cities,
    groups: f.groups,
    tracks: [],
    categories: f.categories,
    maxMillions: f.maxMillions,
    roadmapOnly: false,
    sort: f.sort === "name" ? "name" : "year1",
    dir: f.sort === "name" ? f.dir : "asc",
  };
  return serializeMajorFilters(major);
}
