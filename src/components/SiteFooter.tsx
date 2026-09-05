import Link from "next/link";

import Logo from "@/components/Logo";
import { FOOTER_COLUMNS, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/site";

// Server Component — static. Expanded from the 3-line note block to the columned
// footer in ../mockup/Landing.dc.html now that the marketing/content pages exist.
// The data-disclaimer lines (../yeu-cau-san-pham.md §6) stay, moved to the
// bottom bar. Columns come from lib/site.ts; a null href renders as plain text
// (page not built yet). Social row under the wordmark/tagline mirrors
// ../mockup/Footer.preview.html.
export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight text-ink"
          >
            <Logo className="h-6 w-6" />
            <span>
              họcphí<span className="text-accent">.info</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm text-ink-2">{SITE_TAGLINE}</p>

          <ul className="flex flex-wrap gap-2.5 pt-1">
            {SOCIAL_LINKS.map((s) => {
              const external = s.icon !== "gmail";
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    {...(external
                      ? { target: "_blank", rel: "me noopener noreferrer" }
                      : {})}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-2 transition-colors hover:border-accent-border hover:text-accent-strong"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">
              {col.title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  {!link.href ? (
                    <span className="text-ink-3" title="Sắp có">
                      {link.label}
                    </span>
                  ) : link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-ink-2 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    // mailto: / external — plain anchor, no client-side routing.
                    <a href={link.href} className="text-ink-2 hover:text-ink">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-5 text-xs text-ink-3">
          <p>
            Số liệu học phí là <strong>dữ liệu tham khảo</strong> để lập kế
            hoạch, không phải tư vấn tài chính và không phải cam kết của nhà
            trường. Mọi mức học phí quy về đồng/năm; tổng cả khoá là ước lượng
            theo % tăng.
          </p>
          <p>
            © 2026 hocphi.info · Cập nhật 09/2026 · Pilot 50 trường TP.HCM &amp;
            Hà Nội.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Inline SVGs (18×18) ported from ../mockup/Footer.preview.html. `currentColor`
// so they inherit the anchor's text colour and its hover state.
function SocialIcon({ name }: { name: (typeof SOCIAL_LINKS)[number]["icon"] }) {
  const s = "h-[18px] w-[18px]";
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={s} aria-hidden>
          <path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.6-1.5H18V.2C17.6.1 16.3 0 15 0c-2.8 0-4.5 1.7-4.5 4.7V6H8v3h2.5v9H14V9Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className={s}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "threads":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className={s}
          aria-hidden
        >
          <path d="M12 21c-5 0-8-3.4-8-9s3-9 8-9c3.6 0 6 1.7 7.2 4.4" />
          <path d="M8.5 13c0-2 1.6-3.3 3.6-3.3 2.4 0 3.7 1.6 3.7 4.1 0 3-1.9 4.2-3.8 4.2-1.7 0-2.8-1-2.8-2.3 0-1.4 1.2-2.2 2.9-2.2 2.6 0 4.4 1.3 4.4 4" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={s} aria-hidden>
          <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.3 8.5h3.3V21H3.3V8.5Zm5.5 0h3.15v1.7h.05c.44-.83 1.5-1.7 3.1-1.7 3.3 0 3.9 2.17 3.9 5V21h-3.3v-4.9c0-1.17 0-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V21H8.8V8.5Z" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={s} aria-hidden>
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
        </svg>
      );
    case "gmail":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className={s}
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
  }
}
