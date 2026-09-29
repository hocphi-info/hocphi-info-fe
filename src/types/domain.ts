// Shared domain types for hocphi-info-fe.
//
// Two halves, kept apart on purpose:
//
//  1. CONTRACT WITH THE BACKEND — every type below the "generated" banner is an
//     alias into `api.gen.ts`, which `npm run gen:api` generates from the
//     backend's committed `openapi.json` (../hocphi-info-be). Never hand-edit
//     those shapes: change the Pydantic model in the BE, run `make openapi`
//     there, then `npm run gen:api` here and let `tsc` point at what to fix.
//     The old names (School, MajorRow, Track…) stay as aliases so the ~20 files
//     importing them didn't have to change.
//
//  2. FE-ONLY VIEW MODELS — shapes the client derives itself (school stats
//     computed from MajorRow[], see lib/filters.ts). Hand-written, at the bottom.

import type { components } from "./api.gen";

type Schemas = components["schemas"];

// --- Generated contract (aliases into api.gen.ts) ---

export type CityCode = Schemas["CityCode"];
export type SchoolCategory = Schemas["SchoolCategory"];
export type Track = Schemas["ProgramTrack"];
export type ProgramLanguage = Schemas["ProgramLanguage"];
export type IncreaseSource = Schemas["IncreaseSourceKind"];
export type Confidence = Schemas["ConfidenceLevel"];
export type SourceDocType = Schemas["SourceDocType"];

export type School = Schemas["SchoolOut"];
export type Major = Schemas["MajorOut"];
export type Program = Schemas["ProgramOut"];
/** Tài liệu gốc của 1 mức học phí (F12) — chỉ Năm 1 (bản ghi thật) có nguồn;
 * các năm dự phóng là số tính, không có `Source` riêng. */
export type Source = Schemas["SourceOut"];
export type TuitionRecord = Schemas["TuitionRecordOut"];
export type ProgramIncrease = Schemas["ProgramIncreaseOut"];

/** Một dòng ở màn hình "Tra cứu theo ngành" (S1) = 1 program đã ghép đủ ngữ cảnh. */
export type MajorRow = Schemas["MajorRowOut"];

// Phân loại ngành theo danh mục Bộ GD&ĐT (Lĩnh vực → Nhóm ngành → Ngành). `Major.taxonomy`
// là null khi ngành "Chưa phân loại" (chưa có mã 7 số trong danh mục).
export type TaxonomyNode = Schemas["TaxonomyNodeOut"];
export type Taxonomy = Schemas["TaxonomyOut"];
/** Ngành cùng nhóm ngành, hiện ở trang chi tiết ngành-trường (số trường + khoảng
 * học phí năm 1 hệ đại trà). */
export type RelatedMajor = Schemas["RelatedMajorOut"];

// Tuần 4: trang chi tiết ngành-trường (F6) + trang chi tiết trường (F7).
export type YearlyAmount = Schemas["YearlyAmountOut"];
/** 1 hệ đào tạo (track/language) trong trang chi tiết ngành-trường (F6). */
export type ProgramDetail = Schemas["ProgramDetailOut"];
export type ProgramDetailResponse = Schemas["ProgramDetailResponseOut"];
/** 1 hàng / hệ đào tạo trong trang chi tiết trường (F7). */
export type SchoolTrackStat = Schemas["SchoolTrackStatOut"];
export type SchoolProgramRow = Schemas["SchoolProgramRowOut"];
export type SchoolDetailResponse = Schemas["SchoolDetailResponseOut"];

// Trang "Dữ liệu & nguồn" (F14): độ phủ dữ liệu, từ GET /api/v1/coverage.
export type CoverageTotals = Schemas["CoverageTotalsOut"];
export type CoverageCityRow = Schemas["CoverageCityRowOut"];
export type CoverageCategoryRow = Schemas["CoverageCategoryRowOut"];
/** Dòng theo lĩnh vực; `fieldCode = null` là dòng "Chưa phân loại". */
export type CoverageFieldRow = Schemas["CoverageFieldRowOut"];
export type CoverageSchoolRow = Schemas["CoverageSchoolRowOut"];
export type CoverageResponse = Schemas["CoverageOut"];

// --- FE-only view models (hand-written; NOT part of the API contract) ---

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

// Ô "Tìm nhanh" (F13) không còn kiểu riêng: nó chỉ ghi `?q=` vào URL và
// MajorResultsView lọc `MajorRow[]` sẵn có theo tên (xem lib/filters.ts).
