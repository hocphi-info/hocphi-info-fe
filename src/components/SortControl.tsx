"use client";

// Client Component — replaces the disabled SortDropdown from Week 1. The mockup
// (mockup/Main.dc.html: .sortcat / .sortdir) splits sorting into two controls:
// a criterion button (which field) and a direction toggle (asc / desc). Both
// write to the URL via history.pushState, so a shared link keeps the sort.
//
// Generic over the sort-key type so both S1 (MajorSortKey) and S2 (SchoolSortKey)
// can use it — the caller passes its own labels map.

import { useSearchParams } from "next/navigation";
import type { SortDir } from "@/lib/filters";
import { setOne } from "@/lib/url";
import { writeParams } from "@/lib/url";

export default function SortControl<K extends string>({
  labels,
  value,
  dir,
  defaultKey,
}: {
  /** Ordered map of sort key -> Vietnamese label. */
  labels: Record<K, string>;
  value: K;
  dir: SortDir;
  /** The key that is NOT written to the URL (the default). */
  defaultKey: K;
}) {
  const sp = useSearchParams();
  const keys = Object.keys(labels) as K[];

  function pickCriterion(next: K) {
    let params = new URLSearchParams(sp.toString());
    params = setOne(params, "sort", next === defaultKey ? null : next);
    writeParams(params, "push");
  }

  function toggleDir() {
    let params = new URLSearchParams(sp.toString());
    params = setOne(params, "dir", dir === "asc" ? "desc" : null);
    writeParams(params, "push");
  }

  return (
    <div className="flex items-stretch">
      <label className="flex items-center gap-2 rounded-l-md border border-r-0 border-border bg-surface px-3 py-1.5 text-sm text-ink-2">
        <span className="hidden sm:inline">Sắp xếp theo:</span>
        <select
          value={value}
          onChange={(e) => pickCriterion(e.target.value as K)}
          className="bg-transparent font-medium text-ink focus:outline-none"
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {labels[k]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={toggleDir}
        aria-label={
          dir === "asc"
            ? "Đang tăng dần — bấm để giảm dần"
            : "Đang giảm dần — bấm để tăng dần"
        }
        title={dir === "asc" ? "Tăng dần" : "Giảm dần"}
        className="rounded-r-md border border-border bg-accent-bg px-2.5 text-accent-ink"
      >
        {dir === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}
