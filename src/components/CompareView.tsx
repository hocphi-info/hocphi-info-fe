"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  IncreaseSource,
  Source,
  Track,
  YearlyAmount,
} from "@/types/domain";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import { compareParamsFrom, hasTrackMismatch } from "@/lib/compare";
import CompareEmptyState from "@/components/CompareEmptyState";
import CompareTable from "@/components/CompareTable";
import CompareTrendChart from "@/components/CompareTrendChart";

export interface CompareItemData {
  id: string;
  label: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  schoolShortName: string;
  majorName: string;
  track: Track;
  year1Amount: number;
  medianPerYearAmount: number;
  totalCourse: number;
  increasePct: number | null;
  increaseSource: IncreaseSource | null;
  source: Source | null;
  yearlyAmounts: YearlyAmount[];
}

// Client Component — thân trang so sánh (F8, Tuần 5). Nhận `initialItems` đã
// fetch xong từ page.tsx (Server Component), rồi TỰ LỌC theo `item` hiện tại
// trên URL qua useCompareSelection — xoá 1 mục chỉ là bớt cột hiển thị,
// KHÔNG fetch lại (dữ liệu mọi mục ban đầu đã có sẵn ở đây).
export default function CompareView({
  initialItems,
  missingCount = 0,
}: {
  initialItems: CompareItemData[];
  missingCount?: number;
}) {
  const { selectedIds, toggle } = useCompareSelection();
  const [copied, setCopied] = useState(false);

  const visible = initialItems.filter((item) => selectedIds.includes(item.id));

  if (visible.length < 2) {
    return (
      <CompareEmptyState
        remaining={visible[0] && { id: visible[0].id, label: visible[0].label }}
      />
    );
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/nganh?${compareParamsFrom(selectedIds)}`}
          className="text-sm text-ink-3 hover:text-accent hover:underline"
        >
          ← Về trang tra cứu để chọn thêm/đổi mục
        </Link>
      </div>

      {missingCount > 0 && (
        <p className="text-sm text-ink-3">
          {missingCount === 1
            ? "1 mục không còn tồn tại và đã được bỏ qua."
            : `${missingCount} mục không còn tồn tại và đã được bỏ qua.`}
        </p>
      )}

      {hasTrackMismatch(visible) && (
        <aside className="rounded-lg border border-warn-ink/30 bg-warn-bg px-4 py-3 text-sm text-warn-ink">
          Bạn đang so sánh các hệ đào tạo khác nhau — con số không tương đương.
        </aside>
      )}

      <CompareTable items={visible} onRemove={toggle} />

      <CompareTrendChart items={visible} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-full border border-accent-border bg-surface px-4 py-1.5 text-sm font-medium text-accent-ink shadow-sm hover:bg-surface-2"
        >
          {copied ? "Đã sao chép!" : "Copy link so sánh"}
        </button>
      </div>
    </div>
  );
}
