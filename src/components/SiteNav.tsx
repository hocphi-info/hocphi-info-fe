"use client";

// Client Component — the ONLY reason it needs "use client" is usePathname().
// SiteHeader (its parent) stays a Server Component; only this small nav island
// hydrates. Before this, SiteHeader hard-coded which tab was "active" and the
// unbuilt tabs were dimmed <span>s. Now every nav target is a real route, so we
// compute the active tab from the current path at runtime.
//
// "active" rule: exact match, or the current path is nested under the tab's
// href (so /nganh/dh-luat-tphcm/luat still highlights "Tra cứu").

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/lib/site";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm md:flex">
      {NAV_LINKS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "border-b-2 border-accent pb-0.5 font-medium text-ink"
                : "pb-0.5 font-medium text-ink-2 hover:text-ink"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
