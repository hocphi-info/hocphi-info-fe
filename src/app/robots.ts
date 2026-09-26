import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

// Special file convention: `app/robots.ts` → served at /robots.txt.
// Policy (see ../mockup/SEO-GEO-AIO.md §5): allow search engines AND the
// crawlers behind generative engines (the goal is to be cited), block only the
// API routes and query-string URLs (filter/sort/compare state, no index value).
// A fuller per-bot list lives in the mockup notes; this keeps the shipped file
// simple and revisits it if bandwidth or licensing ever becomes a concern.
// `/icon.svg` is explicitly allowed even though Next.js appends a cache-busting
// `?hash` query string to it — otherwise the blanket `/*?` rule below also blocks
// Googlebot from fetching the favicon referenced in <link rel="icon">.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/icon.svg"],
        disallow: ["/api/", "/*?"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
