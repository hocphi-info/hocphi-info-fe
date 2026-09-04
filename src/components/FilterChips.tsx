"use client";

// Client Component — the mobile filter-chip row (spec S1 mobile: "hàng chip tóm
// tắt bộ lọc đang bật"). Each chip has an X that removes just that one filter
// from the URL. Hidden on lg+ where the full FilterPanel is visible.
//
// The chip list itself is computed by a pure helper (majorFilterChips /
// schoolFilterChips) so this component only does the click -> URL wiring.

import { useSearchParams } from "next/navigation";
import type { FilterChip } from "@/lib/filters";
import { removeParam, writeParams } from "@/lib/url";

export default function FilterChips({ chips }: { chips: FilterChip[] }) {
  const sp = useSearchParams();

  if (chips.length === 0) return null;

  function drop(chip: FilterChip) {
    const next = removeParam(
      new URLSearchParams(sp.toString()),
      chip.param,
      chip.value,
    );
    writeParams(next, "push");
  }

  return (
    <div className="flex flex-wrap gap-2 lg:hidden">
      {chips.map((chip) => (
        <button
          key={`${chip.param}:${chip.value ?? ""}`}
          type="button"
          onClick={() => drop(chip)}
          className="inline-flex items-center gap-1 rounded-full border border-accent-border bg-accent-bg px-3 py-1 text-xs text-accent-ink"
        >
          {chip.label}
          <span aria-hidden className="text-ink-3">
            ✕
          </span>
          <span className="sr-only">— bỏ lọc</span>
        </button>
      ))}
    </div>
  );
}
