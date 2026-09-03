// Shared domain types for hocphi-info-fe.
//
// Field names mirror the backend schema (../hocphi-info-be/docs/schema.md v0.2) so
// that Week 2 can swap the mock data source for a real `fetch` without touching any
// component. Backend enums are Postgres enums; here they are string union types —
// TypeScript's idiomatic stand-in for an enum (learning note #19).

export type CityCode = "HCM" | "HN";

export type MajorGroupCode =
  "CNTT" | "KY_THUAT" | "KINH_TE" | "Y_DUOC" | "LUAT" | "LOGISTICS";

export type SchoolCategory =
  "cong_lap" | "cong_lap_tu_chu" | "tu_thuc" | "tu_thuc_von_nuoc_ngoai";

export type Track = "dai_tra" | "chat_luong_cao" | "tien_tien" | "quoc_te";

export type ProgramLanguage = "vi" | "en" | "vi_en";

export type IncreaseSource = "published_roadmap" | "default_estimate";

export type Confidence = "verified" | "published_unverified" | "estimated";

export interface School {
  slug: string;
  name: string;
  shortName: string;
  cityCode: CityCode;
  category: SchoolCategory;
}

export interface Major {
  slug: string;
  name: string;
  /** Mã ngành cấp IV — không unique, có thể chưa có với ngành mới mở. */
  code: string | null;
  groupCode: MajorGroupCode;
  requiresPracticeLicense: boolean;
  /** Bắt buộc có khi requiresPracticeLicense = true. */
  practiceProfession: string | null;
}

export interface Program {
  id: string;
  schoolSlug: string;
  majorSlug: string;
  track: Track;
  language: ProgramLanguage;
}

export interface TuitionRecord {
  programId: string;
  /** "YYYY-YYYY", ví dụ "2026-2027". */
  academicYear: string;
  /** Đồng/năm, đã chuẩn hoá về đơn vị chuẩn. */
  amountPerYear: number;
  /** false = số trường công bố (Năm 1); true = dự phóng (Năm 2..N). */
  isProjected: boolean;
  confidence: Confidence;
}

export interface ProgramIncrease {
  programId: string;
  /** % tăng học phí mỗi năm, ví dụ 8 nghĩa là +8%/năm. */
  annualIncreasePct: number;
  increaseSource: IncreaseSource;
}

// --- Shapes ghép sẵn cho UI (không có trong schema BE — là "view model" phía FE) ---

/** Một dòng ở màn hình "Tra cứu theo ngành" (S1) = 1 program đã ghép đủ ngữ cảnh. */
export interface MajorRow {
  program: Program;
  school: School;
  major: Major;
  /** Học phí năm đầu (record có isProjected = false, năm học sớm nhất). */
  year1: TuitionRecord;
  increase: ProgramIncrease | null;
}

/** Thống kê học phí hệ đại trà của một trường, dùng ở màn hình "Tra cứu theo trường" (S2). */
export interface SchoolStats {
  nPrograms: number;
  minAmount: number;
  minMajorName: string;
  medianAmount: number;
  maxAmount: number;
  maxMajorName: string;
  /** "khoảng" (min–max các % tăng) hoặc "hỗn hợp" khi các ngành khác loại nguồn. */
  increaseSummary: string;
}

/** Một dòng ở màn hình "Tra cứu theo trường" (S2). */
export interface SchoolRow {
  school: School;
  stats: SchoolStats;
}
