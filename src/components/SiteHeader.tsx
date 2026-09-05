import Link from "next/link";

import Logo from "@/components/Logo";
import SiteNav from "@/components/SiteNav";
import { mailtoUrl } from "@/lib/site";

// Server Component (no "use client") — pure markup. Layout follows
// ../mockup/*.dc.html: logo · nav tabs · "Báo lỗi". The nav itself is a small
// Client island (SiteNav) because it reads usePathname() to highlight the active
// tab; keeping it separate means the header shell still renders on the server.
// "Báo lỗi" is a plain mailto: anchor (no JS) to lib/site.ts's CONTACT_EMAIL.
export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
        >
          <Logo className="h-7 w-7" />
          <span>
            họcphí<span className="text-accent">.info</span>
          </span>
        </Link>

        <SiteNav />

        <a
          href={mailtoUrl("[hocphi.info] Báo lỗi")}
          aria-label="Báo lỗi qua email"
          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
        >
          {/* Lucide "bug" */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="m8 2 1.88 1.88" />
            <path d="M14.12 3.88 16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />
            <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
            <path d="M6 13H2" />
            <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
            <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
            <path d="M22 13h-4" />
            <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
          </svg>
          <span>Báo lỗi</span>
        </a>
      </div>
    </header>
  );
}
