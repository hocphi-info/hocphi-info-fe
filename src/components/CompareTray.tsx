"use client";

// Client Component — owns the "compare selection" state and shares it via React
// Context (learning note #14) so three far-apart places can read/write one list:
//   - the checkbox on every result row      (CompareCheckbox)
//   - the "So sánh (k)" button in the header
//   - the sticky bottom tray rendered here
//
// Context = InheritedWidget/Provider of Flutter. Passing selectedIds + toggle
// through every layer of props (prop drilling) would be noisy, so we don't.
//
// The tray does NOT navigate to /so-sanh yet — that screen (S5/F8) is Week 5.

import { createContext, useContext, useMemo, useState } from "react";

const MAX = 3;

interface CompareContextValue {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  max: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/** Hook the children call to read the shared selection. */
export function useCompare(): CompareContextValue {
  const value = useContext(CompareContext);
  if (!value) {
    throw new Error("useCompare must be used inside <CompareTray>");
  }
  return value;
}

export default function CompareTray({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Immutable updates (note #8): never push into the existing array — build a
  // new one so React sees the change.
  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) return prev; // đã đủ 3 -> chặn
      return [...prev, id];
    });
  }

  // useMemo keeps the context value object stable between renders unless the
  // selection actually changed — a small optimisation, not essential to grok now.
  const value = useMemo<CompareContextValue>(
    () => ({
      selectedIds,
      isSelected: (id) => selectedIds.includes(id),
      toggle,
      count: selectedIds.length,
      max: MAX,
    }),
    [selectedIds],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}

      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 z-10 mt-4 flex items-center gap-3 rounded-t-lg border border-b-0 border-accent-border bg-surface px-4 py-3 shadow-lg">
          <span className="text-sm font-medium text-ink">
            Đã chọn {selectedIds.length}/{MAX} để so sánh
          </span>
          <button
            type="button"
            disabled
            title="Trang so sánh sẽ có ở giai đoạn sau"
            className="ml-auto rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-on-accent opacity-60"
          >
            So sánh ({selectedIds.length})
          </button>
        </div>
      )}
    </CompareContext.Provider>
  );
}
