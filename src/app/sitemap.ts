import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
