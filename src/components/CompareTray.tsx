"use client";

// Client Component — sticky bottom bar showing the current compare selection.
// Tuần 5 (F8): selection now lives at the URL (useCompareSelection), not in a
// React Context — so this no longer wraps children in a Provider, it just
// renders itself as an independent sibling wherever /nganh places it.
//
// Rendered outside the page's existing <Suspense> (around MajorResultsView),
// so — like ViewModeToggle — it wraps its own useSearchParams() reader in a
// Suspense boundary of its own (fallback: render nothing, same as "no
// selection yet").

import { Suspense } from "react";
import Link from "next/link";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import { compareParamsFrom } from "@/lib/compare";

function CompareTrayInner() {
  const { selectedIds, count, max } = useCompareSelection();

  if (count === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 mt-4 flex items-center gap-3 rounded-t-lg border border-b-0 border-accent-border bg-surface px-4 py-3 shadow-lg">
      <span className="text-sm font-medium text-ink">
        Đã chọn {count}/{max} để so sánh
      </span>
      {count < 2 ? (
        <button
          type="button"
          disabled
          title="Chọn ít nhất 2 mục để so sánh"
          className="ml-auto rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-on-accent opacity-60"
        >
          So sánh ({count})
        </button>
      ) : (
        <Link
          href={`/so-sanh?${compareParamsFrom(selectedIds)}`}
          className="ml-auto rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-on-accent"
        >
          So sánh ({count})
        </Link>
      )}
    </div>
  );
}

export default function CompareTray() {
  return (
    <Suspense fallback={null}>
      <CompareTrayInner />
    </Suspense>
  );
}
