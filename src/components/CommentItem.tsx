"use client";

// Một bình luận + toàn bộ trả lời của nó. Component ĐỆ QUY: phần "trả lời" lại render
// <CommentItem> cho từng con — cây sâu bao nhiêu cũng được, React tự lặp.
//
// Thụt lề: con nằm TRONG cột nội dung của cha (lệch phải 1 avatar) cho tới cấp 3.
// Từ cấp 4, con được render ngang hàng với cha (không lệch thêm) và có chip
// "↩ Tên #tag" — xem `needsReplyChip` ở lib/comments.ts.

import { useState } from "react";
import {
  REPLIES_PREVIEW,
  DELETE_WINDOW_MS,
  avatarHue,
  commentAnchor,
  countDescendants,
  displayName,
  formatFullVi,
  formatRelativeVi,
  needsReplyChip,
  type CommentNode,
} from "@/lib/comments";
import { useCommentThread } from "@/components/comment-context";
import CommentForm from "@/components/CommentForm";
import type { CommentOut } from "@/types/domain";

function Avatar({ c }: { c: CommentOut }) {
  const hue = avatarHue(c.authorTag);
  const initial = c.authorName?.trim().split(/\s+/).at(-1)?.[0]?.toUpperCase();
  return (
    <span
      aria-hidden
      className="cm-avatar flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-[30px] sm:w-[30px]"
      style={{ "--h": hue } as React.CSSProperties}
    >
      {c.isHidden ? <PersonIcon /> : initial ? initial : <PersonIcon />}
    </span>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function label(c: CommentOut): string {
  return `${displayName(c)} #${c.authorTag}`;
}

export default function CommentItem({ node }: { node: CommentNode }) {
  const ctx = useCommentThread();
  const c = node.comment;
  const [collapsed, setCollapsed] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const own = ctx.ownComments[c.id];
  const canDelete =
    !!own && ctx.now - new Date(c.createdAt).getTime() < DELETE_WINDOW_MS;
  const parent = c.parentId ? ctx.byId.get(c.parentId) : undefined;
  const chip =
    needsReplyChip(c.depth) && parent && !parent.isHidden
      ? label(parent)
      : null;

  const replies = showAllReplies
    ? node.children
    : node.children.slice(0, REPLIES_PREVIEW);
  const hiddenReplies = node.children.length - replies.length;
  // Cấp 0..2: con thụt vào trong. Cấp ≥ 3: con đứng ngang hàng (làm phẳng).
  const nestChildren = c.depth < 3;

  async function copyLink() {
    const url = `${location.origin}${location.pathname}#${commentAnchor(c.id)}`;
    history.replaceState(null, "", `#${commentAnchor(c.id)}`);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Trình duyệt nhúng chặn clipboard: URL đã nằm trên thanh địa chỉ, chép tay được.
    }
  }

  async function remove() {
    if (!confirm("Xoá bình luận này? Không thể hoàn tác.")) return;
    setDeleting(true);
    try {
      await ctx.onDelete(c.id);
    } finally {
      setDeleting(false);
    }
  }

  const replyList = (
    <>
      {replies.map((child) => (
        <CommentItem key={child.comment.id} node={child} />
      ))}
      {hiddenReplies > 0 ? (
        <button
          type="button"
          onClick={() => setShowAllReplies(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink hover:text-accent-strong"
        >
          <Chevron /> Xem thêm {hiddenReplies} trả lời
        </button>
      ) : null}
    </>
  );

  if (collapsed) {
    return (
      <div
        id={commentAnchor(c.id)}
        className="flex items-center gap-2 pt-3 text-[13px] text-ink-3"
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-expanded={false}
          aria-label="Mở lại chuỗi trả lời"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-border font-bold text-ink-2 hover:border-accent hover:text-accent-ink sm:h-[30px] sm:w-[30px]"
        >
          +
        </button>
        <b className="font-semibold text-ink-2">
          {c.isHidden ? "[đã ẩn]" : displayName(c)}
        </b>
        {!c.isHidden ? <Tag tag={c.authorTag} /> : null}
        <span>
          · {formatRelativeVi(c.createdAt, ctx.now)} ·{" "}
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="font-semibold text-accent-ink"
          >
            {countDescendants(node)} trả lời đã thu gọn
          </button>
        </span>
      </div>
    );
  }

  const highlighted = ctx.highlightedId === c.id;

  return (
    <>
      <div
        id={commentAnchor(c.id)}
        className="grid scroll-mt-24 grid-cols-[28px_1fr] gap-x-2 pt-3 sm:grid-cols-[30px_1fr] sm:gap-x-2.5"
      >
        <div className="flex flex-col items-center">
          <Avatar c={c} />
          {nestChildren && node.children.length > 0 ? (
            // Đường dọc = nút thu gọn cả chuỗi con (kiểu Reddit).
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-expanded
              aria-label="Thu gọn chuỗi trả lời"
              className="group mt-1.5 flex w-4 flex-1 justify-center"
            >
              <span className="w-0.5 rounded bg-rule group-hover:bg-accent-soft group-focus-visible:bg-accent" />
            </button>
          ) : null}
        </div>

        <div className="min-w-0">
          {/* Nhấn nền chỉ phần nội dung (vừa gửi / mở từ link), không phủ cả cây con. */}
          <div
            className={
              highlighted
                ? "-mx-2 rounded-lg bg-accent-bg px-2 pb-0.5 transition-colors"
                : "transition-colors"
            }
          >
            <div className="flex min-h-7 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] sm:min-h-[30px]">
              {c.isHidden ? (
                <b className="font-medium text-ink-3">[đã ẩn]</b>
              ) : (
                <>
                  <b className="text-sm font-semibold text-ink">
                    {displayName(c)}
                  </b>
                  <Tag tag={c.authorTag} />
                  {own ? (
                    <span className="rounded-full bg-accent-bg px-2 text-[11px] font-bold text-accent-strong">
                      của bạn
                    </span>
                  ) : null}
                </>
              )}
              <time
                dateTime={c.createdAt}
                title={formatFullVi(c.createdAt)}
                className="text-ink-3 before:mr-1.5 before:content-['·']"
              >
                {formatRelativeVi(c.createdAt, ctx.now)}
              </time>
            </div>

            {c.isHidden ? (
              <p className="mb-1.5 text-sm italic text-ink-3">
                Bình luận này đã bị ẩn hoặc đã bị xoá.
              </p>
            ) : (
              <>
                <p className="mb-1.5 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink-2">
                  {chip ? (
                    <span className="mr-1 inline-flex items-center gap-0.5 rounded-md bg-accent-bg px-1.5 align-baseline text-xs font-semibold not-italic text-accent-ink">
                      ↩ {chip}
                    </span>
                  ) : null}
                  {c.body}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-ink-3">
                  <button
                    type="button"
                    onClick={() =>
                      ctx.setReplyingTo(ctx.replyingTo === c.id ? null : c.id)
                    }
                    className="hover:text-accent-ink"
                    aria-expanded={ctx.replyingTo === c.id}
                  >
                    ↩ Trả lời
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="hover:text-accent-ink"
                  >
                    {copied ? "Đã chép liên kết" : "Liên kết"}
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={remove}
                      disabled={deleting}
                      className="text-bad-ink hover:opacity-80 disabled:opacity-50"
                    >
                      {deleting ? "Đang xoá…" : "Xoá"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ctx.onReport(c.id)}
                      className="hover:text-accent-ink"
                    >
                      Báo cáo
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {ctx.replyingTo === c.id ? (
            <CommentForm
              threadKey={ctx.threadKey}
              parentId={c.id}
              replyToLabel={label(c)}
              onPosted={ctx.onPosted}
              onCancel={() => ctx.setReplyingTo(null)}
            />
          ) : null}

          {nestChildren ? replyList : null}
        </div>
      </div>
      {/* Cấp ≥ 3: trả lời đứng ngang hàng, nằm ngoài cột nội dung của cha. */}
      {!nestChildren ? replyList : null}
    </>
  );
}

function Tag({ tag }: { tag: string | null }) {
  if (!tag) return null;
  return (
    <span className="rounded border border-rule bg-surface-2 px-1 font-mono text-[11px] text-ink-3">
      #{tag}
    </span>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
