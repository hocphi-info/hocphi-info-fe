"use client";

// Form viết bình luận / trả lời. Form "có kiểm soát" (controlled): giá trị ô nhập nằm
// trong state, mỗi lần gõ → setState → render lại — như TextEditingController của
// Flutter nhưng state do React giữ.
//
// Form gốc ban đầu chỉ là 1 ô gõ gọn; chạm vào mới mở thêm tên + ô xác minh + nút gửi
// (mockup mobile). Nhờ vậy script Turnstile chỉ nạp khi người dùng thật sự định viết.

import { useId, useState } from "react";
import {
  createComment,
  CommentApiError,
  loadSavedName,
  saveName,
} from "@/lib/comments-api";
import {
  BODY_MAX,
  NAME_MAX,
  errorMessage,
  normalizeBody,
  normalizeName,
  validateCommentInput,
} from "@/lib/comments";
import type { CommentCreated } from "@/types/domain";
import Turnstile, { TURNSTILE_SITE_KEY } from "@/components/Turnstile";

interface Props {
  threadKey: string;
  parentId?: string;
  /** "Tên #tag" của người được trả lời — có thì form ở dạng trả lời (gọn). */
  replyToLabel?: string;
  placeholder?: string;
  onPosted: (created: CommentCreated) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  threadKey,
  parentId,
  replyToLabel,
  placeholder,
  onPosted,
  onCancel,
}: Props) {
  const isReply = parentId !== undefined;
  const fieldId = useId();
  const [body, setBody] = useState("");
  const [name, setName] = useState(() => (isReply ? loadSavedName() : ""));
  const [expanded, setExpanded] = useState(isReply);
  const [token, setToken] = useState<string | null>(null);
  // Đổi số này → <Turnstile key=…> bị gỡ và tạo lại = lấy token mới (token dùng 1 lần).
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tên đã dùng lần trước (localStorage — chỉ có ở trình duyệt). Ô tên chỉ hiện khi form
  // mở rộng, việc đó chỉ xảy ra ở client (chạm vào ô / bấm "Trả lời"), nên đọc lúc mở
  // rộng là an toàn, không làm lệch HTML server ↔ client.
  function expand() {
    if (expanded) return;
    setExpanded(true);
    setName((n) => n || loadSavedName());
  }

  const normalized = normalizeBody(body);
  const tooLong = normalized.length > BODY_MAX;
  const needsToken = TURNSTILE_SITE_KEY !== "";
  const canSubmit =
    !sending && normalized.length > 0 && !tooLong && (!needsToken || !!token);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // không để trình duyệt tự gửi form + tải lại trang
    const authorName = normalizeName(name);
    const invalid = validateCommentInput(normalized, authorName);
    if (invalid) {
      setError(errorMessage(invalid));
      return;
    }
    setSending(true);
    setError(null);
    try {
      const created = await createComment({
        threadKey,
        parentId: parentId ?? null,
        authorName,
        body: normalized,
        turnstileToken: token,
      });
      saveName(authorName ?? "");
      setBody("");
      if (!isReply) setExpanded(false);
      onPosted(created);
    } catch (err) {
      // Giữ nguyên nội dung đã gõ, chỉ hiện lỗi (R6).
      setError(
        err instanceof CommentApiError
          ? errorMessage(err.code, err.retryAfterSeconds)
          : errorMessage("network"),
      );
    } finally {
      setSending(false);
      setToken(null);
      setTurnstileKey((k) => k + 1);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isReply
          ? "mt-2 rounded-xl border border-accent-border bg-surface p-3"
          : "rounded-xl border border-border bg-surface p-3 shadow-sm"
      }
    >
      {replyToLabel ? (
        <div className="mb-2 flex items-center gap-2 text-xs text-ink-3">
          <span>
            Đang trả lời{" "}
            <b className="font-semibold text-ink-2">{replyToLabel}</b>
          </span>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="ml-auto rounded px-1 text-ink-3 hover:text-ink"
              aria-label="Huỷ trả lời"
            >
              ✕
            </button>
          ) : null}
        </div>
      ) : null}

      <label htmlFor={`${fieldId}-body`} className="sr-only">
        {isReply ? "Nội dung trả lời" : "Nội dung bình luận"}
      </label>
      <textarea
        id={`${fieldId}-body`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={expand}
        autoFocus={isReply}
        rows={expanded ? (isReply ? 3 : 4) : 1}
        placeholder={
          placeholder ?? (isReply ? "Viết câu trả lời…" : "Viết bình luận…")
        }
        className="block w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-accent focus:outline-2 focus:outline-accent-border"
      />

      {expanded ? (
        <>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <label htmlFor={`${fieldId}-name`} className="sr-only">
              Tên hiển thị
            </label>
            <input
              id={`${fieldId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="Tên hiển thị (không bắt buộc)"
              autoComplete="nickname"
              className="h-9 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-2 focus:outline-accent-border sm:w-60"
            />
            <Turnstile key={turnstileKey} onToken={setToken} />
            <div className="ml-auto flex items-center gap-3">
              <span
                className={`text-xs tabular-nums ${tooLong ? "font-semibold text-bad-ink" : "text-ink-3"}`}
              >
                {normalized.length} / {BODY_MAX}
              </span>
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-9 rounded-lg px-3 text-sm font-semibold text-ink-2 hover:text-ink"
                >
                  Huỷ
                </button>
              ) : null}
              <button
                type="submit"
                disabled={!canSubmit}
                data-umami-event={isReply ? "comment-reply" : "comment-submit"}
                className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Đang gửi…" : isReply ? "Gửi" : "Gửi bình luận"}
              </button>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-2.5 rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad-ink"
            >
              {error}
            </p>
          ) : null}

          {!isReply ? (
            <div className="mt-2.5 text-xs leading-relaxed text-ink-3">
              Không cần đăng nhập · Để trống tên sẽ hiện <b>Ẩn danh</b> · Không
              chèn đường link, số điện thoại, thông tin cá nhân.{" "}
              <details className="inline">
                <summary className="inline cursor-pointer text-accent-ink underline underline-offset-2">
                  Quy tắc bình luận
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Hỏi đáp, chia sẻ kinh nghiệm thật về học phí, học bổng, chi
                    phí phát sinh.
                  </li>
                  <li>
                    Không quảng cáo, không chèn link, số điện thoại, Zalo,
                    email.
                  </li>
                  <li>
                    Không xúc phạm, quấy rối; không đăng thông tin cá nhân của
                    người khác.
                  </li>
                  <li>
                    Bình luận là ý kiến cá nhân, không phải số liệu đã kiểm
                    chứng của hocphi.info. Bình luận vi phạm hoặc bị nhiều người
                    báo cáo sẽ bị ẩn.
                  </li>
                  <li>
                    Bạn tự xoá được bình luận của mình trong 15 phút trên cùng
                    trình duyệt.
                  </li>
                </ul>
              </details>
            </div>
          ) : null}
        </>
      ) : null}
    </form>
  );
}
