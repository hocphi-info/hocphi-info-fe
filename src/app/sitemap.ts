import type { MetadataRoute } from "next";

import { fetchCoverage, fetchMajorRows } from "@/lib/api";
import { getListedPosts, postUrl } from "@/lib/posts";
import { programPath, schoolPath } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import type { MajorRow } from "@/types/domain";

// Special file convention: `app/sitemap.ts` → served at /sitemap.xml.
//
// `force-dynamic`: the school/program URLs come from the API, which may be
// re-seeded without a front-end deploy, and CI builds with a placeholder API URL.
// Without this Next would bake the list in at build time.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

// Static pages. `dated` ones track the data (list pages change when a school is
// re-seeded) and take the newest school date; the rest omit `lastModified`
// rather than claim "today". /so-sanh is left out on purpose: the page is hidden
// from the nav and without ?ids= it only shows an empty state.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
  dated?: boolean;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1, dated: true },
  { path: "/nganh", changeFrequency: "weekly", priority: 0.9, dated: true },
  { path: "/truong", changeFrequency: "weekly", priority: 0.9, dated: true },
  { path: "/phuong-phap", changeFrequency: "monthly", priority: 0.7 },
  { path: "/du-lieu", changeFrequency: "weekly", priority: 0.7, dated: true },
  { path: "/tai-tro", changeFrequency: "yearly", priority: 0.4 },
];

// "2026-10-10" → 00:00 giờ Việt Nam. `updated ?? date` làm ngày sửa đổi của bài.
function isoDate(date: string): Date {
  return new Date(`${date}T00:00:00+07:00`);
}

/** Per-school last-modified dates (and the newest of them) from /coverage.
 * Any failure -> empty: the sitemap then lists URLs without `lastModified`. */
async function schoolDates(): Promise<{
  bySlug: Map<string, Date>;
  newest: Date | undefined;
}> {
  const bySlug = new Map<string, Date>();
  try {
    const coverage = await fetchCoverage();
    for (const s of coverage.schools) {
      const day = s.lastUpdated ?? s.latestSourceDate;
      if (day) bySlug.set(s.slug, isoDate(day));
    }
  } catch {
    // keep the empty map
  }
  const dates = [...bySlug.values()];
  const newest = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : undefined;
  return { bySlug, newest };
}

/** Every row of the by-major list, or [] if the API is down — the static + blog
 * entries still go out (a failing sitemap is worse than a short one). */
async function majorRowsOrEmpty(): Promise<MajorRow[]> {
  try {
    return await fetchMajorRows();
  } catch {
    return [];
  }
}

/** One entry per school and per (school, major) pair, deduplicated — several
 * tracks/campuses of the same major share a single page. */
function programEntries(rows: MajorRow[], bySlug: Map<string, Date>): Entry[] {
  const entries: Entry[] = [];
  const schools = new Set<string>();
  const pairs = new Set<string>();
  for (const { school, major } of rows) {
    const lastModified = bySlug.get(school.slug);
    if (!schools.has(school.slug)) {
      schools.add(school.slug);
      entries.push({
        url: absoluteUrl(schoolPath(school.slug)),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    const key = `${school.slug}/${major.slug}`;
    if (!pairs.has(key)) {
      pairs.add(key);
      entries.push({
        url: absoluteUrl(programPath(school.slug, major.slug)),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.9,
      });
    }
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ bySlug, newest }, rows] = await Promise.all([
    schoolDates(),
    majorRowsOrEmpty(),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.dated ? newest : undefined,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  entries.push(...programEntries(rows, bySlug));

  // Bài viết (/bai-viet): chỉ có khi đã có ít nhất một bài đăng — danh sách rỗng
  // không nên được lập chỉ mục. Bản production không chứa bài nháp (xem lib/posts.ts).
  const posts = getListedPosts();
  if (posts.length > 0) {
    entries.push({
      url: absoluteUrl("/bai-viet"),
      lastModified: isoDate(posts[0].updated ?? posts[0].date),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const post of posts) {
      entries.push({
        url: postUrl(post.slug),
        lastModified: isoDate(post.updated ?? post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
