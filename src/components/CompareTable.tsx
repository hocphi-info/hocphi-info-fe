"use client";

import type { IncreaseSource, Source, Track } from "@/types/domain";
import { formatMillions, TRACK_LABELS } from "@/lib/format";
import IncreaseBadge from "@/components/IncreaseBadge";

export interface CompareTableItem {
  id: string;
  label: string;
  schoolName: string;
  majorName: string;
  track: Track;
  year1Amount: number;
  medianPerYearAmount: number;
  totalCourse: number;
  increasePct: number | null;
  increaseSource: IncreaseSource | null;
  source: Source | null;
}

const DOC_TYPE_LABELS: Record<Source["docType"], string> = {
  de_an_tuyen_sinh: "Đề án tuyển sinh",
  thong_bao_hoc_phi: "Thông báo học phí",
  quy_dinh_nghe: "Quy định nghề",
  khac: "Khác",
};

// Bảng đối chiếu (R2, F8) — CSS grid: 1 cột nhãn + N cột mục (2-3). Mỗi cột
// có nút xoá riêng ở đầu (R6) — gọi `onRemove`, được cha (CompareView) nối
// vào useCompareSelection().toggle. "Chênh so với rẻ nhất" tính ngay ở đây từ
// `totalCourse` của các mục khác — không cần dữ liệu mới, thay cho ý
// "khoảng Min-Max" trong yêu cầu gốc (không có field range/mục để hiện riêng).
export default function CompareTable({
  items,
  onRemove,
}: {
  items: CompareTableItem[];
  onRemove: (id: string) => void;
}) {
  const cheapestTotal = Math.min(...items.map((i) => i.totalCourse));

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div
        className="grid min-w-[560px]"
        style={{
          gridTemplateColumns: `180px repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Header: tên trường + nút xoá */}
        <div className="border-b border-border bg-surface-2 px-3 py-2" />
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 border-b border-l border-border bg-surface-2 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">
                {item.schoolName}
              </div>
              <div className="truncate text-xs text-ink-3">
                {item.majorName}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Bỏ khỏi so sánh: ${item.label}`}
              className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface hover:text-ink"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Hệ đào tạo */}
        <div className="border-b border-border px-3 py-2 text-sm text-ink-3">
          Hệ đào tạo
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-l border-border px-3 py-2 text-center text-sm text-ink"
          >
            {TRACK_LABELS[item.track]}
          </div>
        ))}

        {/* Học phí năm đầu */}
        <div className="border-b border-border bg-accent-bg/40 px-3 py-2 text-sm text-ink-3">
          Học phí năm đầu
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-l border-border bg-accent-bg/40 px-3 py-2 text-center text-sm tabular-nums text-ink"
          >
            {formatMillions(item.year1Amount)}
          </div>
        ))}

        {/* Trung vị/năm cả khoá */}
        <div className="border-b border-border px-3 py-2 text-sm text-ink-3">
          Trung vị/năm cả khoá
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-l border-border px-3 py-2 text-center text-sm tabular-nums text-ink"
          >
            {formatMillions(item.medianPerYearAmount)}
          </div>
        ))}

        {/* Tổng cả khoá — hàng nhấn mạnh */}
        <div className="border-b border-border bg-accent-bg px-3 py-2 text-sm font-medium text-accent-ink">
          Tổng học phí cả khoá
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-l border-border bg-accent-bg px-3 py-2 text-center text-sm font-semibold tabular-nums text-accent-ink"
          >
            {formatMillions(item.totalCourse, { approx: true })}
          </div>
        ))}

        {/* Tăng học phí/năm */}
        <div className="border-b border-border px-3 py-2 text-sm text-ink-3">
          Tăng học phí/năm
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-l border-border px-3 py-2 text-center"
          >
            <IncreaseBadge
              pct={item.increasePct}
              source={item.increaseSource}
            />
          </div>
        ))}

        {/* Chênh so với rẻ nhất */}
        <div className="border-b border-border px-3 py-2 text-sm text-ink-3">
          Chênh so với rẻ nhất
        </div>
        {items.map((item) => {
          const delta = item.totalCourse - cheapestTotal;
          return (
            <div
              key={item.id}
              className="border-b border-l border-border px-3 py-2 text-center text-sm tabular-nums text-ink"
            >
              {delta === 0 ? (
                <span className="text-ink-3">Rẻ nhất</span>
              ) : (
                `+${formatMillions(delta, { approx: true })}`
              )}
            </div>
          );
        })}

        {/* Nguồn · cập nhật */}
        <div className="px-3 py-2 text-sm text-ink-3">Nguồn · cập nhật</div>
        {items.map((item) => (
          <div
            key={item.id}
            className="border-l border-border px-3 py-2 text-center text-xs"
          >
            {item.source ? (
              <a
                href={item.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {DOC_TYPE_LABELS[item.source.docType]}
                {item.source.publishedDate && ` · ${item.source.publishedDate}`}
              </a>
            ) : (
              <span className="text-ink-3">Chưa có nguồn cụ thể</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
