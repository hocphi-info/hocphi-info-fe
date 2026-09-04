"use client";

// Client Component — replaces the standalone SortControl. It lives INSIDE a <th>
// and turns the column label into a sort toggle. The Server table
// (MajorResultsTable) can render this Client leaf; only this cell needs
// interactivity, so the table itself stays a Server Component.
//
// Display state (`active`, `dir`) comes down as PROPS from MajorResultsView
// (which already reads the URL). This component only touches the URL in its
// click handler — same mechanism as the old SortControl: setOne + writeParams,
// i.e. history.pushState, no server round-trip. It sits under the <Suspense>
// boundary that nganh/page.tsx already puts around MajorResultsView, so
// useSearchParams() here needs no new boundary.
//
// Generic over the sort-key type so /truong can reuse it later.

import { useSearchParams } from "next/navigation";
import type { SortDir } from "@/lib/filters";
import { setOne, writeParams } from "@/lib/url";

export default function SortableHeader<K extends string>({
  sortKey,
  label,
  active,
  dir,
  defaultKey,
  align = "left",
}: {
  /** The sort key this column writes to the URL. */
  sortKey: K;
  label: string;
  /** filters.sort === sortKey */
  active: boolean;
  /** Only meaningful when `active`. */
  dir: SortDir;
  /** The key that is NOT written to the URL (the default). */
  defaultKey: K;
  align?: "left" | "right" | "center";
}) {
  const sp = useSearchParams();

  function onClick() {
    let params = new URLSearchParams(sp.toString());
    if (active) {
      // Toggle direction: asc -> desc -> (drop dir, back to the asc default).
      params = setOne(params, "dir", dir === "asc" ? "desc" : null);
    } else {
      // Switch column: set sort (omit if it's the default), reset to asc.
      params = setOne(params, "sort", sortKey === defaultKey ? null : sortKey);
      params = setOne(params, "dir", null);
    }
    writeParams(params, "push");
  }

  const justify =
    align === "right"
      ? "justify-end"
      : align === "center"
        ? "justify-center"
        : "justify-start";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        active
          ? dir === "asc"
            ? `Sắp xếp theo ${label} — đang tăng dần, bấm để giảm dần`
            : `Sắp xếp theo ${label} — đang giảm dần, bấm để tăng dần`
          : `Sắp xếp theo ${label}`
      }
      className={`group flex w-full items-center gap-1 font-medium text-ink-3 ${justify}`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={
          active
            ? "text-accent-ink"
            : "text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
        }
      >
        {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}
