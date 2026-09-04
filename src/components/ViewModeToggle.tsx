"use client";

// Client Component — the "Theo ngành ↔ Theo trường" switch (F5). Week 3: it now
// carries the COMPATIBLE filters across when you switch screens, per spec F5
// ("giữ nguyên bộ lọc tương thích"). The per-param mapping lives in pure helpers
// (majorParamsToSchool / schoolParamsToMajor): city + loại trường + nhóm ngành +
// tuition cap carry over; hệ đào tạo, "chỉ trường công bố lộ trình", "cơ sở tính
// khoảng" and screen-only sorts are dropped silently.
//
// Still renders <Link> (not router.push) so Next keeps prefetching the other
// screen; the href just carries the translated query string.
//
// useSearchParams needs a <Suspense> boundary during prerender, so the default
// export wraps the inner reader in one — callers just render <ViewModeToggle />
// wherever, no boundary of their own.

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { majorParamsToSchool, schoolParamsToMajor } from "@/lib/filters";

type Screen = "nganh" | "truong";

const BASE_CLASS =
  "inline-flex rounded-full border border-border bg-surface p-1 text-sm";

function Tab({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
        active ? "bg-accent text-on-accent" : "text-ink-2 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

function ToggleInner({ current }: { current: Screen }) {
  const sp = useSearchParams();

  const nganhQs =
    current === "nganh" ? sp.toString() : schoolParamsToMajor(sp).toString();
  const truongQs =
    current === "truong" ? sp.toString() : majorParamsToSchool(sp).toString();

  return (
    <div className={BASE_CLASS}>
      <Tab
        label="Theo ngành"
        href={nganhQs ? `/nganh?${nganhQs}` : "/nganh"}
        active={current === "nganh"}
      />
      <Tab
        label="Theo trường"
        href={truongQs ? `/truong?${truongQs}` : "/truong"}
        active={current === "truong"}
      />
    </div>
  );
}

/** Static fallback shown until useSearchParams resolves (links carry no query). */
function ToggleFallback({ current }: { current: Screen }) {
  return (
    <div className={BASE_CLASS}>
      <Tab label="Theo ngành" href="/nganh" active={current === "nganh"} />
      <Tab label="Theo trường" href="/truong" active={current === "truong"} />
    </div>
  );
}

export default function ViewModeToggle({ current }: { current: Screen }) {
  return (
    <Suspense fallback={<ToggleFallback current={current} />}>
      <ToggleInner current={current} />
    </Suspense>
  );
}
