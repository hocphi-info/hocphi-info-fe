"use client";

import { useSearchParams } from "next/navigation";

import { setOne, writeParams } from "@/lib/url";

// Client Component — the "Tìm nhanh" box. It is NOT a search-as-you-type
// dropdown anymore: whatever the user types goes straight into `?q=`
// (replaceState — no history spam, no server round-trip), and MajorResultsView
// re-derives the visible rows from it on the spot. The full row list is already
// in the browser, so filtering ~150 rows by name is instant — there is nothing
// to debounce and nothing to fetch. `?q=` is parsed in lib/filters.ts
// (parseMajorFilters) and matched against "tên trường + tên viết tắt + tên
// ngành", bỏ dấu — same rule as the backend `?search=` param.
//
// Fully URL-controlled (no local state), same as FilterPanel's inputs: reading
// the value back from useSearchParams() is what makes the mobile chip's ✕ and
// Back/Forward stay in sync for free.
export default function QuickSearch() {
  const sp = useSearchParams();
  const value = sp.get("q") ?? "";

  function update(next: string) {
    writeParams(
      setOne(new URLSearchParams(sp.toString()), "q", next || null),
      "replace",
    );
  }

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => update(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") update("");
      }}
      placeholder="Tìm trường / ngành…"
      aria-label="Tìm nhanh trường hoặc ngành"
      className="w-full rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink shadow-sm placeholder:text-ink-3"
    />
  );
}
