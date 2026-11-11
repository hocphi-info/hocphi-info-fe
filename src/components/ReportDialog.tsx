"use client";

// Hộp "Báo cáo bình luận" dùng thẻ <dialog> gốc của trình duyệt: `showModal()` tự lo
// lớp phủ, khoá focus trong hộp, phím Esc để đóng — không cần thư viện modal.
// Tương đương Flutter: showDialog(...). Cha đặt `key` = id bình luận đang báo cáo nên
// mỗi lần mở cho bình luận khác là một instance mới (state lý do / thông báo tự sạch).

import { useEffect, useRef, useState } from "react";
import { REPORT_REASONS } from "@/lib/comments";
import type { CommentReportReason } from "@/types/domain";

export default function ReportDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  /** Trả về thông báo hiển thị cho người dùng sau khi gửi. */
  onSubmit: (reason: CommentReportReason) => Promise<string>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<CommentReportReason>("spam");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Đồng bộ prop `open` → trạng thái thật của <dialog> (API mệnh lệnh của DOM).
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      setMessage(await onSubmit(reason));
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-xl border border-border bg-surface p-5 text-ink shadow-xl backdrop:bg-black/40"
    >
      <div className="flex items-center">
        <h2 className="text-lg font-bold">Báo cáo bình luận</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="ml-auto rounded px-1.5 text-ink-3 hover:text-ink"
        >
          ✕
        </button>
      </div>
      {message ? (
        <>
          <p className="mt-3 text-sm text-ink-2">{message}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent"
            >
              Đóng
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <p className="mt-1.5 mb-2 text-[13px] text-ink-3">
            Bình luận bị nhiều người báo cáo sẽ tự ẩn chờ xem xét.
          </p>
          <fieldset>
            <legend className="sr-only">Lý do</legend>
            {REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg px-3 text-sm font-semibold text-ink-2 hover:text-ink"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={sending}
              className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-50"
            >
              {sending ? "Đang gửi…" : "Gửi báo cáo"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
