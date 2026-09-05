import Link from "next/link";

import Logo from "@/components/Logo";

// Server Component (no "use client") — pure markup. Layout follows
// ../mockup/Main.dc.html: logo · nav tabs. QuickSearch used to live here but
// moved to the results toolbar (it belongs with the page it searches).
//
// NAV_TABS is a config array: adding a tab later (blog / research, …) is one
// line. Only "Tra cứu" has a route today; the rest render as dimmed <span>s
// (not links, no "#") until their pages exist. The active tab is hard-coded for
// now — when more routes land, split a small Client child that reads
// usePathname() to compute `active`.
const NAV_TABS = [
  { label: "Tra cứu", href: "/nganh" as const, active: true },
  { label: "So sánh", href: "/so-sanh" as const, active: false },
  { label: "Phương pháp", href: null, active: false },
  { label: "Dữ liệu & nguồn", href: null, active: false },
];

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

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_TABS.map((tab) =>
            tab.href ? (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={
                  tab.active
                    ? "border-b-2 border-accent pb-0.5 font-medium text-ink"
                    : "pb-0.5 font-medium text-ink-2 hover:text-ink"
                }
              >
                {tab.label}
              </Link>
            ) : (
              <span
                key={tab.label}
                title="Sắp có"
                className="cursor-default pb-0.5 font-medium text-ink-3"
              >
                {tab.label}
              </span>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
