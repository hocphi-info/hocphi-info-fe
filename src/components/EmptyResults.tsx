"use client";

// Client Component — shown in place of the table + chart when the filters match
// nothing (R11, spec S1 "Không có kết quả"). The reset button clears every query
// param, which is exactly what the panel's "Đặt lại" does.
//
// No useRouter needed: the visible list is fully client-derived from
// useSearchParams, so history.pushState alone triggers the re-render.

import { writeParams } from "@/lib/url";

export default function EmptyResults() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-2 px-6 py-12 text-center">
      <p className="text-base font-medium text-ink">
        Không tìm thấy ngành – trường nào khớp bộ lọc
      </p>
      <p className="mt-1 text-sm text-ink-3">
        Thử bỏ bớt một vài điều kiện để mở rộng kết quả.
      </p>
      <button
        type="button"
        onClick={() => writeParams(new URLSearchParams(), "push")}
        className="mt-4 rounded-md border border-accent-border px-4 py-1.5 text-sm font-medium text-accent-ink hover:bg-accent-bg"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
}
