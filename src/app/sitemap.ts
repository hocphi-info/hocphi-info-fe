import type { MetadataRoute } from "next";

import { getListedPosts, postUrl } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

// Special file convention: `app/sitemap.ts` → served at /sitemap.xml.
// Static routes only for now. The high-value dynamic entries — one URL per
// /nganh/{slug}, /truong/{slug} and /nganh/{truong}/{nganh} — need the list of
// schools/majors from the API; add them here (map over a fetch) once that
// endpoint is wired, with `lastModified` from each record's verified date.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/nganh", changeFrequency: "weekly", priority: 0.9 },
  { path: "/truong", changeFrequency: "weekly", priority: 0.9 },
  { path: "/so-sanh", changeFrequency: "monthly", priority: 0.6 },
  { path: "/phuong-phap", changeFrequency: "monthly", priority: 0.7 },
  { path: "/du-lieu", changeFrequency: "weekly", priority: 0.7 },
  { path: "/tai-tro", changeFrequency: "yearly", priority: 0.4 },
];

// "2026-10-10" → 00:00 giờ Việt Nam. `updated ?? date` làm ngày sửa đổi của bài.
function postDate(date: string): Date {
  return new Date(`${date}T00:00:00+07:00`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Bài viết (/bai-viet): chỉ có khi đã có ít nhất một bài đăng — danh sách rỗng
  // không nên được lập chỉ mục. Bản production không chứa bài nháp (xem lib/posts.ts).
  const posts = getListedPosts();
  if (posts.length > 0) {
    entries.push({
      url: absoluteUrl("/bai-viet"),
      lastModified: postDate(posts[0].updated ?? posts[0].date),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const post of posts) {
      entries.push({
        url: postUrl(post.slug),
        lastModified: postDate(post.updated ?? post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
