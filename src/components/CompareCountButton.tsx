"use client";

// Client Component — the "So sánh (k)" button in the results header. It only
// needs the count from CompareTray, so it's a tiny wrapper around useCompare.
// Disabled until there are 2+ selections; navigation to /so-sanh is Week 5.

import { useCompare } from "@/components/CompareTray";

export default function CompareCountButton() {
  const { count } = useCompare();
  return (
    <button
      type="button"
      disabled={count < 2}
      title={
        count < 2 ? "Chọn ít nhất 2 mục để so sánh" : "Trang so sánh sẽ có sau"
      }
      className="rounded-full border border-accent-border bg-surface px-4 py-1.5 text-sm font-medium text-accent-ink shadow-sm disabled:opacity-50"
    >
      So sánh ({count})
    </button>
  );
}
