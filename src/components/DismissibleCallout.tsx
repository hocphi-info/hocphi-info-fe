"use client";

// Client Component (learning note #12) — needs state + a click handler, so the
// file starts with "use client". This is the simplest useState example in Week 1:
// one boolean that, once true, makes the component render nothing.

import { useState } from "react";

export default function DismissibleCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // [value, setter] = useState(initialValue)  — note #7
  const [dismissed, setDismissed] = useState(false);

  // Conditional render — note #10. Returning null renders nothing.
  if (dismissed) return null;

  return (
    <aside className="relative rounded-lg border border-accent-border bg-accent-bg px-4 py-3 pr-10 text-sm text-accent-ink">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-ink-2">{children}</div>
      <button
        type="button"
        aria-label="Đóng ghi chú"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
      >
        ✕
      </button>
    </aside>
  );
}
