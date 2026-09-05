// Site-wide constants: canonical URL, name, tagline, nav + footer link config.
// Kept in one place so metadata (layout.tsx), robots.ts, sitemap.ts and the
// JSON-LD blocks all agree on the same URL and wording.
//
// SITE_URL is the production origin. It has no env var yet (the app only sets
// NEXT_PUBLIC_API_URL); when a deploy domain is finalised, swap the literal or
// read it from an env var here — every consumer picks the change up.

export const SITE_URL = "https://hocphi.info";
export const SITE_NAME = "hocphi.info";
export const SITE_TAGLINE =
  "Tra cứu & so sánh học phí đại học Việt Nam theo ngành – trường, kèm ước lượng tổng chi phí cả khoá 4–5 năm.";

/** Địa chỉ nhận mọi email từ site: liên hệ, báo lỗi, báo số liệu sai. */
export const CONTACT_EMAIL = "nvbien.contact@gmail.com";

/** `mailto:` tới CONTACT_EMAIL, kèm subject để phân loại thư đến. */
export function mailtoUrl(subject?: string): string {
  return subject
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CONTACT_EMAIL}`;
}

/** Absolute URL helper for canonical / OG / JSON-LD. `path` starts with "/". */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** Footer social row — thứ tự khớp ../mockup/Footer.preview.html. `icon` map
 *  sang inline SVG trong SiteFooter. Gmail là mailto: tới CONTACT_EMAIL, các
 *  link còn lại mở tab mới. */
export const SOCIAL_LINKS: {
  label: string;
  href: string;
  icon: "facebook" | "instagram" | "threads" | "linkedin" | "github" | "gmail";
}[] = [
  {
    label: "Facebook",
    href: "https://facebook.com/hocphi.info",
    icon: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/hocphi.info",
    icon: "instagram",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@hocphi.info",
    icon: "threads",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/hocphi-info",
    icon: "linkedin",
  },
  { label: "GitHub", href: "https://github.com/hocphi-info", icon: "github" },
  { label: "Email", href: mailtoUrl(), icon: "gmail" },
];

/** Primary nav — label + route. `usePathname()` in SiteNav marks the active one. */
export const NAV_LINKS = [
  { label: "Tra cứu", href: "/nganh" },
  // { label: "So sánh", href: "/so-sanh" },
  { label: "Phương pháp", href: "/phuong-phap" },
  { label: "Dữ liệu & nguồn", href: "/du-lieu" },
] as const;

/** Footer link columns. Entries with `href: null` render as plain text
 *  (page not built yet) — same pattern SiteHeader used for dimmed tabs. */
export const FOOTER_COLUMNS: {
  title: string;
  links: { label: string; href: string | null }[];
}[] = [
  {
    title: "Tra cứu",
    links: [
      { label: "Học phí theo ngành", href: "/nganh" },
      { label: "Học phí theo trường", href: "/truong" },
      // { label: "So sánh", href: "/so-sanh" },
    ],
  },
  {
    title: "Về dữ liệu",
    links: [
      { label: "Phương pháp luận", href: "/phuong-phap" },
      { label: "Dữ liệu & nguồn", href: "/du-lieu" },
      {
        label: "Báo số liệu chưa đúng",
        href: mailtoUrl("[hocphi.info] Báo số liệu chưa đúng"),
      },
    ],
  },
  {
    title: "Dự án",
    links: [
      { label: "Tài trợ dự án", href: "/tai-tro" },
      // { label: "Giới thiệu", href: null },
      { label: "Liên hệ", href: mailtoUrl("[hocphi.info] Liên hệ") },
    ],
  },
];
