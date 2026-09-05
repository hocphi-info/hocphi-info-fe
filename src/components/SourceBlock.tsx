import type { Source } from "@/types/domain";

const DOC_TYPE_LABELS: Record<Source["docType"], string> = {
  de_an_tuyen_sinh: "Đề án tuyển sinh",
  thong_bao_hoc_phi: "Thông báo học phí",
  quy_dinh_nghe: "Quy định nghề",
  khac: "Khác",
};

// Khối "Nguồn dữ liệu" (F12) — chỉ ở trang chi tiết ngành-trường (F6), không
// lặp lại ở trang chi tiết trường (F7). Chỉ Năm 1 (bản ghi công bố thật) có
// `source`; các năm dự phóng (Năm 2..N) là số tính, không có nguồn riêng —
// ghi rõ điều này thay vì để người dùng tưởng nhầm.
export default function SourceBlock({ source }: { source: Source | null }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-sm">
      <div className="mb-2 font-semibold text-ink">Nguồn dữ liệu</div>
      {source ? (
        <>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="break-all text-accent hover:underline"
          >
            {source.url}
          </a>
          <div className="mt-1 text-ink-3">
            {DOC_TYPE_LABELS[source.docType]}
            {source.publishedDate && ` · Công bố ${source.publishedDate}`}
          </div>
        </>
      ) : (
        <p className="text-ink-3">Chưa có nguồn cụ thể cho mức học phí này.</p>
      )}
      <p className="mt-2 text-xs text-ink-3">
        Số liệu Năm 1 lấy từ nguồn trên; các năm sau là số dự phóng theo % tăng,
        không có nguồn riêng.
      </p>
    </div>
  );
}
