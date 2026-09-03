import Link from "next/link";

// Server Component (no "use client") — pure markup, no state or events.
// The search box is a placeholder for F13 (typeahead), disabled for now so the
// slot is visible without pretending to work.
export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink">
          hocphi<span className="text-accent">.info</span>
        </Link>
        <div className="ml-auto w-full max-w-xs">
          <input
            type="search"
            disabled
            placeholder="Tìm trường / ngành…"
            aria-label="Tìm nhanh trường hoặc ngành (sắp có)"
            className="w-full rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm text-ink-2 placeholder:text-ink-3"
          />
        </div>
      </div>
    </header>
  );
}
