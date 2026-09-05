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

export type SourceDocType =
  "de_an_tuyen_sinh" | "thong_bao_hoc_phi" | "quy_dinh_nghe" | "khac";

export interface School {
  slug: string;
  name: string;
  shortName: string;
  cityCode: CityCode;
  category: SchoolCategory;
  /** URL logo trường (BE: schools.logo_url). null = chưa có → SchoolLogo hiện
   * chữ viết tắt. Ảnh có thể vuông / chữ nhật dọc / chữ nhật ngang. */
  logoUrl: string | null;
}

export interface Major {
  slug: string;
  name: string;
  /** Mã ngành cấp IV — không unique, có thể chưa có với ngành mới mở. */
  code: string | null;
  groupCode: MajorGroupCode;
  /** Số năm chuẩn của khoá (bác sĩ 6, cử nhân 4). BE: majors.standard_years. */
  standardYears: number;
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

/** Tài liệu gốc của 1 mức học phí (F12) — chỉ Năm 1 (bản ghi thật) có nguồn;
 * các năm dự phóng là số tính, không có `Source` riêng. */
export interface Source {
  url: string;
  docType: SourceDocType;
  publishedDate: string | null;
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
  /** null = chưa có nguồn cụ thể trong DB (xem SourceBlock cho cách hiện). */
  source: Source | null;
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

/** Một gợi ý của ô tìm nhanh (F13). View-model thuần FE: QuickSearch dựng từ
 * `GET /api/majors?search=` + `GET /api/schools?search=` rồi gộp lại (không còn
 * endpoint /api/search riêng). */
export interface SearchHit {
  kind: "school" | "major";
  slug: string;
  name: string;
  /** Chỉ có với trường (short_name). */
  shortName?: string;
}

// --- Tuần 4: trang chi tiết ngành-trường (F6) + trang chi tiết trường (F7) ---

/** 1 năm trong bảng học phí tính luỹ tiến — số TÍNH, không phải TuitionRecord
 * thật (không có `confidence`/`source`). */
export interface YearlyAmount {
  academicYear: string;
  amountPerYear: number;
  isProjected: boolean;
}

/** 1 hệ đào tạo (track/language) trong trang chi tiết ngành-trường (F6).
 * Trả từ GET /api/schools/{school}/majors/{major}. */
export interface ProgramDetail {
  program: Program;
  year1: TuitionRecord;
  increase: ProgramIncrease | null;
  yearlyAmounts: YearlyAmount[];
  totalCourse: number;
  /** Bằng totalCourse cho tới khi post_grad_requirements có dữ liệu thật. */
  totalWithLicense: number;
}

export interface ProgramDetailResponse {
  school: School;
  major: Major;
  programs: ProgramDetail[];
}

/** 1 hàng / hệ đào tạo trong trang chi tiết trường (F7) — Min-Max theo hệ,
 * không phải theo ngành. */
export interface SchoolTrackStat {
  track: Track;
  nPrograms: number;
  minAmount: number;
  minMajorName: string;
  medianAmount: number;
  maxAmount: number;
  maxMajorName: string;
}

/** 1 dòng trong bảng danh sách ngành của 1 trường (F7). `year1.source` luôn
 * null ở đây — F12 chỉ hiện ở trang F6, không lặp lại ở F7. */
export interface SchoolProgramRow {
  program: Program;
  major: Major;
  year1: TuitionRecord;
}

export interface SchoolDetailResponse {
  school: School;
  trackStats: SchoolTrackStat[];
  programs: SchoolProgramRow[];
}
