// Mock data for Week 1 — hard-coded arrays standing in for the API.
//
// Every number here is ILLUSTRATIVE and unverified (see ../yeu-cau-san-pham.md).
// Field names match the backend schema so Week 2 can replace `getMajorRows()` /
// `getSchoolRows()` internals with `await fetch(...)` and nothing else changes.
//
// Coverage (plan R18): every school `category`; both cities; a major with
// requiresPracticeLicense; both increase sources; one school with a single
// program (min = max).

import type {
  Major,
  MajorRow,
  Program,
  ProgramIncrease,
  School,
  SchoolRow,
  TuitionRecord,
} from "@/types/domain";
import { schoolTuitionStats } from "@/lib/derive";

export const schools: School[] = [
  {
    slug: "bach-khoa-hcm",
    name: "Trường Đại học Bách khoa (ĐHQG-HCM)",
    shortName: "HCMUT",
    cityCode: "HCM",
    category: "cong_lap_tu_chu",
  },
  {
    slug: "khtn-hcm",
    name: "Trường Đại học Khoa học Tự nhiên (ĐHQG-HCM)",
    shortName: "HCMUS",
    cityCode: "HCM",
    category: "cong_lap_tu_chu",
  },
  {
    slug: "kinh-te-luat-hcm",
    name: "Trường Đại học Kinh tế – Luật (ĐHQG-HCM)",
    shortName: "UEL",
    cityCode: "HCM",
    category: "cong_lap_tu_chu",
  },
  {
    slug: "y-duoc-hcm",
    name: "Đại học Y Dược TP.HCM",
    shortName: "UMP",
    cityCode: "HCM",
    category: "cong_lap",
  },
  {
    slug: "van-lang",
    name: "Trường Đại học Văn Lang",
    shortName: "VLU",
    cityCode: "HCM",
    category: "tu_thuc",
  },
  {
    slug: "rmit",
    name: "Đại học RMIT Việt Nam",
    shortName: "RMIT",
    cityCode: "HCM",
    category: "tu_thuc_von_nuoc_ngoai",
  },
  {
    slug: "bach-khoa-hn",
    name: "Đại học Bách khoa Hà Nội",
    shortName: "HUST",
    cityCode: "HN",
    category: "cong_lap_tu_chu",
  },
  {
    slug: "kinh-te-quoc-dan",
    name: "Trường Đại học Kinh tế Quốc dân",
    shortName: "NEU",
    cityCode: "HN",
    category: "cong_lap_tu_chu",
  },
  {
    slug: "luat-hn",
    name: "Trường Đại học Luật Hà Nội",
    shortName: "HLU",
    cityCode: "HN",
    category: "cong_lap",
  },
  {
    slug: "fpt-hn",
    name: "Trường Đại học FPT",
    shortName: "FPTU",
    cityCode: "HN",
    category: "tu_thuc",
  },
];

export const majors: Major[] = [
  {
    slug: "khoa-hoc-may-tinh",
    name: "Khoa học máy tính",
    code: "7480101",
    groupCode: "CNTT",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "cong-nghe-thong-tin",
    name: "Công nghệ thông tin",
    code: "7480201",
    groupCode: "CNTT",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "ky-thuat-dien",
    name: "Kỹ thuật điện",
    code: "7520201",
    groupCode: "KY_THUAT",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "logistics-quan-ly-chuoi-cung-ung",
    name: "Logistics và quản lý chuỗi cung ứng",
    code: "7510605",
    groupCode: "LOGISTICS",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "kinh-te",
    name: "Kinh tế",
    code: "7310101",
    groupCode: "KINH_TE",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "quan-tri-kinh-doanh",
    name: "Quản trị kinh doanh",
    code: "7340101",
    groupCode: "KINH_TE",
    requiresPracticeLicense: false,
    practiceProfession: null,
  },
  {
    slug: "luat",
    name: "Luật",
    code: "7380101",
    groupCode: "LUAT",
    requiresPracticeLicense: true,
    practiceProfession: "luật sư",
  },
  {
    slug: "y-khoa",
    name: "Y khoa",
    code: "7720101",
    groupCode: "Y_DUOC",
    requiresPracticeLicense: true,
    practiceProfession: "bác sĩ",
  },
  {
    slug: "rang-ham-mat",
    name: "Răng – Hàm – Mặt",
    code: "7720501",
    groupCode: "Y_DUOC",
    requiresPracticeLicense: true,
    practiceProfession: "bác sĩ răng hàm mặt",
  },
];

// program id quy ước: "<school-slug>__<major-slug>__<track>"
export const programs: Program[] = [
  {
    id: "bach-khoa-hcm__khoa-hoc-may-tinh__dai_tra",
    schoolSlug: "bach-khoa-hcm",
    majorSlug: "khoa-hoc-may-tinh",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "bach-khoa-hcm__ky-thuat-dien__dai_tra",
    schoolSlug: "bach-khoa-hcm",
    majorSlug: "ky-thuat-dien",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "bach-khoa-hcm__khoa-hoc-may-tinh__chat_luong_cao",
    schoolSlug: "bach-khoa-hcm",
    majorSlug: "khoa-hoc-may-tinh",
    track: "chat_luong_cao",
    language: "vi_en",
  },
  {
    id: "khtn-hcm__cong-nghe-thong-tin__dai_tra",
    schoolSlug: "khtn-hcm",
    majorSlug: "cong-nghe-thong-tin",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "khtn-hcm__khoa-hoc-may-tinh__dai_tra",
    schoolSlug: "khtn-hcm",
    majorSlug: "khoa-hoc-may-tinh",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "kinh-te-luat-hcm__kinh-te__dai_tra",
    schoolSlug: "kinh-te-luat-hcm",
    majorSlug: "kinh-te",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "kinh-te-luat-hcm__luat__dai_tra",
    schoolSlug: "kinh-te-luat-hcm",
    majorSlug: "luat",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "y-duoc-hcm__y-khoa__dai_tra",
    schoolSlug: "y-duoc-hcm",
    majorSlug: "y-khoa",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "y-duoc-hcm__rang-ham-mat__dai_tra",
    schoolSlug: "y-duoc-hcm",
    majorSlug: "rang-ham-mat",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "van-lang__quan-tri-kinh-doanh__dai_tra",
    schoolSlug: "van-lang",
    majorSlug: "quan-tri-kinh-doanh",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "van-lang__rang-ham-mat__dai_tra",
    schoolSlug: "van-lang",
    majorSlug: "rang-ham-mat",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "rmit__cong-nghe-thong-tin__quoc_te",
    schoolSlug: "rmit",
    majorSlug: "cong-nghe-thong-tin",
    track: "quoc_te",
    language: "en",
  },
  {
    id: "bach-khoa-hn__khoa-hoc-may-tinh__dai_tra",
    schoolSlug: "bach-khoa-hn",
    majorSlug: "khoa-hoc-may-tinh",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "bach-khoa-hn__ky-thuat-dien__dai_tra",
    schoolSlug: "bach-khoa-hn",
    majorSlug: "ky-thuat-dien",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "kinh-te-quoc-dan__logistics-quan-ly-chuoi-cung-ung__dai_tra",
    schoolSlug: "kinh-te-quoc-dan",
    majorSlug: "logistics-quan-ly-chuoi-cung-ung",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "kinh-te-quoc-dan__kinh-te__dai_tra",
    schoolSlug: "kinh-te-quoc-dan",
    majorSlug: "kinh-te",
    track: "dai_tra",
    language: "vi",
  },
  {
    id: "luat-hn__luat__dai_tra",
    schoolSlug: "luat-hn",
    majorSlug: "luat",
    track: "dai_tra",
    language: "vi",
  },
  // FPT: chỉ một ngành có dữ liệu -> min = max ở màn hình "theo trường"
  {
    id: "fpt-hn__cong-nghe-thong-tin__dai_tra",
    schoolSlug: "fpt-hn",
    majorSlug: "cong-nghe-thong-tin",
    track: "dai_tra",
    language: "vi",
  },
];

// Chỉ lưu năm đầu (2026-2027, isProjected = false) cho Tuần 1.
const YEAR1 = "2026-2027";
function y1(programId: string, amountPerYear: number): TuitionRecord {
  return {
    programId,
    academicYear: YEAR1,
    amountPerYear,
    isProjected: false,
    confidence: "published_unverified",
  };
}

export const tuitionRecords: TuitionRecord[] = [
  y1("bach-khoa-hcm__khoa-hoc-may-tinh__dai_tra", 30_000_000),
  y1("bach-khoa-hcm__ky-thuat-dien__dai_tra", 30_000_000),
  y1("bach-khoa-hcm__khoa-hoc-may-tinh__chat_luong_cao", 80_000_000),
  y1("khtn-hcm__cong-nghe-thong-tin__dai_tra", 29_400_000),
  y1("khtn-hcm__khoa-hoc-may-tinh__dai_tra", 32_800_000),
  y1("kinh-te-luat-hcm__kinh-te__dai_tra", 25_400_000),
  y1("kinh-te-luat-hcm__luat__dai_tra", 25_400_000),
  y1("y-duoc-hcm__y-khoa__dai_tra", 84_700_000),
  y1("y-duoc-hcm__rang-ham-mat__dai_tra", 96_800_000),
  y1("van-lang__quan-tri-kinh-doanh__dai_tra", 30_000_000),
  y1("van-lang__rang-ham-mat__dai_tra", 160_000_000),
  y1("rmit__cong-nghe-thong-tin__quoc_te", 333_000_000),
  y1("bach-khoa-hn__khoa-hoc-may-tinh__dai_tra", 34_000_000),
  y1("bach-khoa-hn__ky-thuat-dien__dai_tra", 26_000_000),
  y1("kinh-te-quoc-dan__logistics-quan-ly-chuoi-cung-ung__dai_tra", 22_000_000),
  y1("kinh-te-quoc-dan__kinh-te__dai_tra", 18_000_000),
  y1("luat-hn__luat__dai_tra", 15_600_000),
  y1("fpt-hn__cong-nghe-thong-tin__dai_tra", 70_500_000),
];

export const programIncreases: ProgramIncrease[] = [
  {
    programId: "bach-khoa-hcm__khoa-hoc-may-tinh__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "published_roadmap",
  },
  {
    programId: "bach-khoa-hcm__ky-thuat-dien__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "published_roadmap",
  },
  {
    programId: "bach-khoa-hcm__khoa-hoc-may-tinh__chat_luong_cao",
    annualIncreasePct: 10,
    increaseSource: "published_roadmap",
  },
  {
    programId: "khtn-hcm__cong-nghe-thong-tin__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  {
    programId: "khtn-hcm__khoa-hoc-may-tinh__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  {
    programId: "kinh-te-luat-hcm__kinh-te__dai_tra",
    annualIncreasePct: 8,
    increaseSource: "published_roadmap",
  },
  {
    programId: "kinh-te-luat-hcm__luat__dai_tra",
    annualIncreasePct: 8,
    increaseSource: "published_roadmap",
  },
  {
    programId: "y-duoc-hcm__y-khoa__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  {
    programId: "y-duoc-hcm__rang-ham-mat__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  {
    programId: "van-lang__quan-tri-kinh-doanh__dai_tra",
    annualIncreasePct: 8,
    increaseSource: "published_roadmap",
  },
  {
    programId: "van-lang__rang-ham-mat__dai_tra",
    annualIncreasePct: 12,
    increaseSource: "default_estimate",
  },
  {
    programId: "rmit__cong-nghe-thong-tin__quoc_te",
    annualIncreasePct: 6,
    increaseSource: "default_estimate",
  },
  {
    programId: "bach-khoa-hn__khoa-hoc-may-tinh__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "published_roadmap",
  },
  {
    programId: "bach-khoa-hn__ky-thuat-dien__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "published_roadmap",
  },
  {
    programId: "kinh-te-quoc-dan__logistics-quan-ly-chuoi-cung-ung__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  {
    programId: "kinh-te-quoc-dan__kinh-te__dai_tra",
    annualIncreasePct: 10,
    increaseSource: "default_estimate",
  },
  // luat-hn__luat: cố tình KHÔNG có -> hàng hiển thị "—" + tooltip
  {
    programId: "fpt-hn__cong-nghe-thong-tin__dai_tra",
    annualIncreasePct: 8,
    increaseSource: "default_estimate",
  },
];

// --- Join helpers: tất cả "logic ghép" nằm ở đây, không ở component ---

const schoolBySlug = new Map(schools.map((s) => [s.slug, s]));
const majorBySlug = new Map(majors.map((m) => [m.slug, m]));
const increaseByProgramId = new Map(
  programIncreases.map((pi) => [pi.programId, pi]),
);
const year1ByProgramId = new Map(
  tuitionRecords
    .filter((t) => !t.isProjected)
    .map((t) => [t.programId, t] as const),
);

/** Mọi dòng cho màn hình "Tra cứu theo ngành" (S1). Tuần 2: thay bằng fetch. */
export function getMajorRows(): MajorRow[] {
  return programs
    .map((program): MajorRow | null => {
      const school = schoolBySlug.get(program.schoolSlug);
      const major = majorBySlug.get(program.majorSlug);
      const year1 = year1ByProgramId.get(program.id);
      if (!school || !major || !year1) return null;
      return {
        program,
        school,
        major,
        year1,
        increase: increaseByProgramId.get(program.id) ?? null,
      };
    })
    .filter((row): row is MajorRow => row !== null);
}

/** Mọi dòng cho màn hình "Tra cứu theo trường" (S2). Tuần 2: thay bằng fetch. */
export function getSchoolRows(): SchoolRow[] {
  const allRows = getMajorRows();
  return schools
    .map((school): SchoolRow => {
      const rowsForSchool = allRows.filter(
        (r) => r.school.slug === school.slug,
      );
      return { school, stats: schoolTuitionStats(rowsForSchool) };
    })
    .filter((r) => r.stats.nPrograms > 0);
}
