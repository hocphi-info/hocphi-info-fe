import Link from "next/link";

import Logo from "@/components/Logo";
import QuickSearch from "@/components/QuickSearch";

// Server Component (no "use client") — pure markup. It *renders* the QuickSearch
// Client Component: a Server Component can contain a Client Component, but not the
// other way round (a Client Component only receives Server ones via children/props).
export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
        >
          <Logo className="h-7 w-7" />
          <span>
            họcphí<span className="text-accent">.info</span>
          </span>
        </Link>
        <QuickSearch />
      </div>
    </header>
  );
}
