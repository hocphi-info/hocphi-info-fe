import Link from "next/link";

import Logo from "@/components/Logo";
import SiteNav from "@/components/SiteNav";

// Server Component (no "use client") — pure markup. Layout follows
// ../mockup/*.dc.html: logo · nav tabs. The nav itself is a small Client island
// (SiteNav) because it reads usePathname() to highlight the active tab; keeping
// it separate means the header shell still renders on the server.
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
      </div>
    </header>
  );
}
