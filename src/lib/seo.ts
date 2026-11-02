import type { Metadata } from "next";

import {
  campusLabel,
  DOC_TYPE_LABELS,
  formatDateVi,
  TRACK_LABELS,
} from "@/lib/format";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import type {
  CityCode,
  ProgramDetail,
  ProgramDetailResponse,
  School,
  SchoolDetailResponse,
} from "@/types/domain";

// SEO/GEO helpers for the school and program detail pages: <head> metadata, the
// one-sentence "answer first" lead, and JSON-LD objects. Everything here is pure
// (data in, plain object/string out) so page.tsx stays a thin caller.
// Plan: docs/plans/2026-11-02-001-feat-seo-geo-school-program-pages-plan.md.
// Rule of thumb for JSON-LD: only emit what the page also shows. Missing data ->
// the key is left out (JSON.stringify drops `undefined`), never an empty value.

const CITY_NAMES: Record<CityCode, string> = {
  HCM: "TP. Hồ Chí Minh",
  HN: "Hà Nội",
};

const DATASET_LICENSE = "https://creativecommons.org/licenses/by-nc/4.0/";

// ── Text helpers ──────────────────────────────────────────────────────────────

/** "HUTECH (ĐH Công nghệ TP.HCM)"; just the name when there's no distinct short name. */
export function schoolLabel(
  school: Pick<School, "name" | "shortName">,
): string {
  return school.shortName && school.shortName !== school.name
    ? `${school.shortName} (${school.name})`
    : school.name;
}

/** "2026-2027" -> "2026–2027" (en dash, as the page copy writes years). */
export function formatAcademicYear(year: string): string {
  return year.replace("-", "–");
}

/** Most common academic year in a list; a tie goes to the later year. */
export function modalAcademicYear(years: string[]): string | null {
  const counts = new Map<string, number>();
  for (const y of years) counts.set(y, (counts.get(y) ?? 0) + 1);
  let best: string | null = null;
  for (const [y, n] of counts) {
    if (best === null) best = y;
    else {
      const bestN = counts.get(best) ?? 0;
      if (n > bestN || (n === bestN && y > best)) best = y;
    }
  }
  return best;
}

/** 33_000_000 -> "33"; 33_500_000 -> "33,5"; 1_398_000_000 -> "1.398" (VN style). */
export function millionsText(dong: number): string {
  return (dong / 1_000_000).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  });
}

/** Cut to `max` chars at a word boundary, adding "…" only when something was cut. */
export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

/** Metadata shared by every page this module builds. A child's `openGraph` REPLACES
 * the layout's object (Next merges metadata shallowly), so type/siteName/locale/url
 * are repeated here. `path` is the clean canonical path, no query string. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const { title, description, path } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "vi_VN",
      url: absoluteUrl(path),
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const ESTIMATE_CAVEAT = " Số liệu là ước lượng.";

function isEstimateOnly(school: Pick<School, "tuitionDisclosure">): boolean {
  return school.tuitionDisclosure?.level === "khong_minh_bach";
}

// ── School page ───────────────────────────────────────────────────────────────

export function schoolPath(slug: string): string {
  return `/truong/${slug}`;
}

/** Title + the visible lead sentence (reused as description and JSON-LD text). */
export function schoolSummary(detail: SchoolDetailResponse): {
  title: string;
  lead: string;
} {
  const { school, trackStats, programs } = detail;
  const label = schoolLabel(school);
  const year = modalAcademicYear(programs.map((p) => p.year1.academicYear));
  const yearText = year ? ` ${formatAcademicYear(year)}` : "";
  const title = `Học phí ${label}${yearText}`;

  const stat = trackStats.find((s) => s.track === "dai_tra") ?? trackStats[0];
  const lead = stat
    ? `Học phí ${label}${year ? ` năm học ${formatAcademicYear(year)}` : ""}: ` +
      `hệ ${TRACK_LABELS[stat.track].toLowerCase()} từ ${millionsText(stat.minAmount)} đến ` +
      `${millionsText(stat.maxAmount)} triệu đồng/năm (trung vị ${millionsText(stat.medianAmount)} triệu đồng), ` +
      `${stat.nPrograms} chương trình đã có dữ liệu.`
    : `Học phí ${label} theo ngành và hệ đào tạo.`;
  return { title, lead };
}

export function schoolMetadata(detail: SchoolDetailResponse): Metadata {
  const { title, lead } = schoolSummary(detail);
  const caveat = isEstimateOnly(detail.school) ? ESTIMATE_CAVEAT : "";
  return pageMetadata({
    title,
    description: truncateDescription(lead, 160 - caveat.length) + caveat,
    path: schoolPath(detail.school.slug),
  });
}

export function schoolLd(school: School): Record<string, unknown> {
  const path = schoolPath(school.slug);
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${absoluteUrl(path)}#school`,
    name: school.name,
    alternateName:
      school.shortName && school.shortName !== school.name
        ? school.shortName
        : undefined,
    logo: school.logoUrl ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: CITY_NAMES[school.cityCode],
      addressCountry: "VN",
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

// ── Program (school × major) page ─────────────────────────────────────────────

export function programPath(schoolSlug: string, majorSlug: string): string {
  return `/nganh/${schoolSlug}/${majorSlug}`;
}

/** The program a page-level summary talks about: base-campus mass-market track
 * first, then any mass-market track, then whatever comes first. */
export function primaryProgram(programs: ProgramDetail[]): ProgramDetail {
  return (
    programs.find((p) => p.program.track === "dai_tra" && !p.program.campus) ??
    programs.find((p) => p.program.track === "dai_tra") ??
    programs[0]
  );
}

export function programSummary(detail: ProgramDetailResponse): {
  title: string;
  lead: string;
} {
  const { school, major, programs } = detail;
  const main = primaryProgram(programs);
  const year = formatAcademicYear(main.year1.academicYear);
  const title = `Học phí ngành ${major.name} – ${school.shortName ?? school.name} ${year}`;

  const where = [
    `hệ ${TRACK_LABELS[main.program.track].toLowerCase()}`,
    main.program.campus ? campusLabel(main.program.campus) : null,
  ]
    .filter(Boolean)
    .join(", ");
  const parts = [
    `Học phí ngành ${major.name} tại ${schoolLabel(school)} năm học ${year} là ` +
      `${millionsText(main.year1.amountPerYear)} triệu đồng/năm (${where})` +
      (main.totalCourse > 0
        ? `, ước tính ${millionsText(main.totalCourse)} triệu đồng cho cả khoá ${major.standardYears} năm.`
        : "."),
  ];
  if (programs.length > 1) {
    parts.push(
      `Ngành có ${programs.length} hệ/cơ sở đào tạo với mức học phí khác nhau.`,
    );
  }
  const source = main.year1.source;
  if (source) {
    parts.push(
      `Nguồn: ${DOC_TYPE_LABELS[source.docType]}` +
        (source.publishedDate
          ? `, công bố ${formatDateVi(source.publishedDate)}.`
          : "."),
    );
  }
  return { title, lead: parts.join(" ") };
}

export function programMetadata(detail: ProgramDetailResponse): Metadata {
  const { title, lead } = programSummary(detail);
  const caveat = isEstimateOnly(detail.school) ? ESTIMATE_CAVEAT : "";
  // Description keeps just the first sentence group (the number) so it fits ~160
  // chars; the full lead with source and multi-track note stays on the page.
  const firstSentence = lead.split(/(?<=\.)\s/)[0];
  return pageMetadata({
    title,
    description:
      truncateDescription(firstSentence, 160 - caveat.length) + caveat,
    path: programPath(detail.school.slug, detail.major.slug),
  });
}

export function courseLd(
  detail: ProgramDetailResponse,
): Record<string, unknown> {
  const { school, major, programs } = detail;
  const path = programPath(school.slug, major.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${major.name} – ${schoolLabel(school)}`,
    description: programSummary(detail).lead,
    courseCode: major.code ?? undefined,
    inLanguage: "vi-VN",
    mainEntityOfPage: absoluteUrl(path),
    provider: {
      "@type": "CollegeOrUniversity",
      "@id": `${absoluteUrl(schoolPath(school.slug))}#school`,
      name: school.name,
    },
    offers: programs.map((p) => ({
      "@type": "Offer",
      category: "Tuition",
      name:
        TRACK_LABELS[p.program.track] +
        (p.program.campus ? ` · ${campusLabel(p.program.campus)}` : ""),
      price: p.year1.amountPerYear,
      priceCurrency: "VND",
      description: `Học phí năm học ${formatAcademicYear(p.year1.academicYear)}, đồng/năm`,
    })),
  };
}

export function datasetLd(
  detail: ProgramDetailResponse,
): Record<string, unknown> {
  const { school, major, programs } = detail;
  const main = primaryProgram(programs);
  const source = main.year1.source;

  // "2026-2027" … "2029-2030" across every program -> "2026/2030".
  const years = programs.flatMap((p) =>
    p.yearlyAmounts.map((y) => y.academicYear.split("-").map(Number)),
  );
  const starts = years.map(([s]) => s).filter(Number.isFinite);
  const ends = years.map(([, e]) => e).filter(Number.isFinite);
  const temporalCoverage =
    starts.length && ends.length
      ? `${Math.min(...starts)}/${Math.max(...ends)}`
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Học phí ngành ${major.name} tại ${school.name}`,
    description: programSummary(detail).lead,
    url: absoluteUrl(programPath(school.slug, major.slug)),
    inLanguage: "vi-VN",
    creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    license: DATASET_LICENSE,
    isAccessibleForFree: true,
    variableMeasured: "Học phí đại học (đồng/năm)",
    temporalCoverage,
    isBasedOn: source?.url,
    dateModified: source?.publishedDate ?? undefined,
  };
}

// ── Shared ────────────────────────────────────────────────────────────────────

export function breadcrumbLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
