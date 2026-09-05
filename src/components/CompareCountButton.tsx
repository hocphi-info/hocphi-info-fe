"use client";

// Client Component — the "So sánh (k)" button in the results header. Below 2
// selections it's an inert disabled button; from 2+ it becomes a real <Link>
// to /so-sanh (Tuần 5, F8) carrying the current selection in `item=` params —
// a genuine cross-route navigation, so this uses <Link>, not the
// pushState-only writeParams() that same-route selection changes use.

import Link from "next/link";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import { compareParamsFrom } from "@/lib/compare";

export default function CompareCountButton() {
  const { selectedIds, count } = useCompareSelection();

  const baseClass =
    "rounded-full border border-accent-border bg-surface px-4 py-1.5 text-sm font-medium text-accent-ink shadow-sm";

  if (count < 2) {
    return (
      <button
        type="button"
        disabled
        title="Chọn ít nhất 2 mục để so sánh"
        className={`${baseClass} disabled:opacity-50`}
      >
        So sánh ({count})
      </button>
    );
  }

  return (
    <Link
      href={`/so-sanh?${compareParamsFrom(selectedIds)}`}
      className={`${baseClass} hover:bg-surface-2`}
    >
      So sánh ({count})
    </Link>
  );
}
