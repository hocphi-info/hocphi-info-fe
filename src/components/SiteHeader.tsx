import Link from "next/link";

import QuickSearch from "@/components/QuickSearch";

// Server Component (no "use client") — pure markup. It *renders* the QuickSearch
// Client Component: a Server Component can contain a Client Component, but not the
// other way round (a Client Component only receives Server ones via children/props).
export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink">
          hocphi<span className="text-accent">.info</span>
        </Link>
        <QuickSearch />
      </div>
    </header>
  );
}
