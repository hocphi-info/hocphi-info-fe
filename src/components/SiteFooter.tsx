import Link from "next/link";

import Logo from "@/components/Logo";
import { FOOTER_COLUMNS, SITE_TAGLINE } from "@/lib/site";

// Server Component — static. Expanded from the 3-line note block to the columned
// footer in ../mockup/Landing.dc.html now that the marketing/content pages exist.
// The data-disclaimer lines (../yeu-cau-san-pham.md §6) stay, moved to the
// bottom bar. Columns come from lib/site.ts; a null href renders as plain text
// (page not built yet).
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
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">
              {col.title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-ink-2 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-ink-3" title="Sắp có">
                      {link.label}
                    </span>
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
