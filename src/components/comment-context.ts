"use client";

// Dữ liệu dùng chung cho cả cây bình luận. Cây có thể sâu tuỳ ý (CommentItem tự gọi
// lại chính nó), truyền props qua từng cấp sẽ rất dài — Context cho mọi cấp đọc thẳng.
// Tương đương Flutter: InheritedWidget / Provider đặt ở gốc cây.

import { createContext, useContext } from "react";
import type { CommentCreated, CommentOut } from "@/types/domain";
import type { OwnComment } from "@/lib/comments-api";

export interface CommentThreadValue {
  threadKey: string;
  /** Mốc thời gian dùng cho "5 phút trước" + hạn tự xoá — cập nhật mỗi 30 giây. */
  now: number;
  /** Tra nhanh bình luận cha (chip "↩ Tên #tag" ở cấp ≥ 4). */
  byId: Map<string, CommentOut>;
  ownComments: Record<string, OwnComment>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  highlightedId: string | null;
  onPosted: (created: CommentCreated) => void;
  onDelete: (id: string) => Promise<void>;
  onReport: (id: string) => void;
}

export const CommentThreadContext = createContext<CommentThreadValue | null>(
  null,
);

export function useCommentThread(): CommentThreadValue {
  const v = useContext(CommentThreadContext);
  if (!v) throw new Error("useCommentThread phải nằm trong <CommentSection>");
  return v;
}
