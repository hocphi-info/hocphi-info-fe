import Link from "next/link";

// Server Component — the "Theo ngành ↔ Theo trường" switch. In Week 1 it is just
// two <Link>s navigating between /nganh and /truong (no shared filter state yet).

const TABS = [
  { href: "/nganh", label: "Theo ngành", key: "nganh" },
  { href: "/truong", label: "Theo trường", key: "truong" },
] as const;

export default function ViewModeToggle({
  current,
}: {
  current: "nganh" | "truong";
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1 text-sm">
      {TABS.map((tab) => {
        const active = tab.key === current;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
              active ? "bg-accent text-on-accent" : "text-ink-2 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
