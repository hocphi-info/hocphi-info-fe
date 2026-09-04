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

  const isDefaultCol = sortKey === defaultKey;

  function onClick() {
    // Per-column 3-state cycle: (chưa sắp xếp) → tăng dần → giảm dần → (chưa
    // sắp xếp). The 3rd click drops both `sort` and `dir`, so the list falls
    // back to the app's default sort.
    //
    // The default column is always `active` (its key is the fallback sort), so it
    // never sees the 1st-click branch: it just toggles tăng ⇄ giảm, and the
    // "clear" branch returns it to its resting tăng-dần state.
    let params = new URLSearchParams(sp.toString());

    if (!active) {
      // 1st click on this column → tăng dần (drop `dir`; asc is the default)
      params = setOne(params, "sort", isDefaultCol ? null : sortKey);
      params = setOne(params, "dir", null);
    } else if (dir === "asc") {
      // 2nd click → giảm dần
      params = setOne(params, "sort", isDefaultCol ? null : sortKey);
      params = setOne(params, "dir", "desc");
    } else {
      // 3rd click (đang giảm dần) → bỏ sắp xếp, quay về sort mặc định
      params = setOne(params, "sort", null);
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

  const hint = !active
    ? "bấm để sắp xếp tăng dần"
    : dir === "asc"
      ? "đang tăng dần — bấm để sắp xếp giảm dần"
      : isDefaultCol
        ? "đang giảm dần — bấm để sắp xếp tăng dần"
        : "đang giảm dần — bấm để bỏ sắp xếp";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Sắp xếp theo ${label}; ${hint}`}
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
