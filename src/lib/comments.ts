// Bình luận ẩn danh — các hàm THUẦN (không React, không gọi mạng), để đọc/hiểu dữ liệu
// trước khi đọc UI. Cùng tinh thần lib/filters.ts: logic tách khỏi component.
//
// API trả danh sách PHẲNG (gốc của trang này + toàn bộ con cháu); `buildTree` dựng
// thành cây theo `parentId`. Quy tắc hiển thị độ sâu (see plan, R10): dữ liệu không
// giới hạn, giao diện thụt tối đa 3 cấp, cấp ≥ 4 hiện ngang cấp 3 kèm chip "↩ Tên #tag".

import type { CommentOut, CommentReportReason } from "@/types/domain";

export const MAX_VISUAL_DEPTH = 3;
export const BODY_MIN = 3;
export const BODY_MAX = 2000;
export const NAME_MAX = 40;
/** Mỗi bình luận hiện sẵn tối đa 3 trả lời trực tiếp, còn lại gom vào "Xem thêm". */
export const REPLIES_PREVIEW = 3;
/** Khớp DELETE_WINDOW của BE: người gửi tự xoá được trong 15 phút. */
export const DELETE_WINDOW_MS = 15 * 60 * 1000;
export const ANON_NAME = "Ẩn danh";

export interface CommentNode {
  comment: CommentOut;
  children: CommentNode[];
}

/** Danh sách phẳng → cây. Giữ nguyên thứ tự đầu vào (API đã sắp gốc theo `sort`, con
 * theo thời gian cũ → mới) nên không cần sort lại. Ví dụ Flutter: giống gom
 * `List<Comment>` thành `Map<parentId, List<Comment>>` rồi dựng widget đệ quy. */
export function buildTree(flat: CommentOut[]): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  for (const c of flat) byId.set(c.id, { comment: c, children: [] });

  const roots: CommentNode[] = [];
  for (const c of flat) {
    const node = byId.get(c.id)!;
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node); // gốc (hoặc cha không có trong trang — coi như gốc)
  }
  return roots;
}

/** Tổng số con cháu (mọi cấp) — dùng cho "N trả lời đã thu gọn". */
export function countDescendants(node: CommentNode): number {
  let n = 0;
  const stack = [...node.children];
  while (stack.length) {
    const cur = stack.pop()!;
    n += 1;
    stack.push(...cur.children);
  }
  return n;
}

/** Bỏ các nút bị ẩn mà không còn hậu duệ hiển thị (giống `_prune` của BE). Dùng sau
 * khi người dùng tự xoá / báo cáo làm ẩn một bình luận ngay trên trang. */
export function pruneHidden(flat: CommentOut[]): CommentOut[] {
  const keep = new Set<string>();
  const byDepth = [...flat].sort((a, b) => b.depth - a.depth);
  for (const c of byDepth) {
    if (!c.isHidden || keep.has(c.id)) {
      keep.add(c.id);
      if (c.parentId) keep.add(c.parentId);
    }
  }
  return flat.filter((c) => keep.has(c.id));
}

/** Bình luận cấp `depth` được thụt lề như cấp mấy. */
export function visualDepth(depth: number): number {
  return Math.min(depth, MAX_VISUAL_DEPTH);
}

/** Cấp ≥ 4 bị "làm phẳng" → cần chip "↩ Tên #tag" để biết đang trả lời ai. */
export function needsReplyChip(depth: number): boolean {
  return depth > MAX_VISUAL_DEPTH;
}

export function displayName(c: Pick<CommentOut, "authorName">): string {
  return c.authorName ?? ANON_NAME;
}

/** Màu avatar ổn định theo #tag (cùng người cùng chuỗi → cùng màu). */
export function avatarHue(tag: string | null): number {
  if (!tag) return 250;
  return (parseInt(tag, 16) * 47) % 360;
}

export function commentAnchor(id: string): string {
  return `binh-luan-${id}`;
}

// ── Kiểm tra trước khi gửi (cùng luật với app/comments_guard.py của BE) ───────────
// BE vẫn kiểm lại — kiểm ở đây chỉ để báo lỗi ngay, không phải chờ mạng.

const LINK_RE =
  /https?:\/\/|www\.|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|vn|net|org|info|io|xyz|me|co|edu|gov|biz|online|site|top|link|ly|app|dev)\b/i;
// Không dùng lookbehind `(?<!\d)`: Safari < 16.4 (trình duyệt nhúng cũ) báo lỗi cú
// pháp ngay khi nạp file, làm hỏng cả khối bình luận.
const PHONE_RE = /(?:^|\D)(?:\+?84|0)(?:[\s.-]?\d){8,10}(?!\d)/;

/** Chuẩn hoá giống BE để đếm ký tự khớp với số BE sẽ đếm. */
export function normalizeBody(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeName(raw: string): string | null {
  const s = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  return s || null;
}

export type CommentErrorCode =
  | "too_short"
  | "too_long"
  | "name_too_long"
  | "contains_link"
  | "contains_phone";

export function validateCommentInput(
  body: string,
  name: string | null,
): CommentErrorCode | null {
  if (body.length < BODY_MIN) return "too_short";
  if (body.length > BODY_MAX) return "too_long";
  if (name && name.length > NAME_MAX) return "name_too_long";
  for (const text of [body, name ?? ""]) {
    if (LINK_RE.test(text)) return "contains_link";
    if (PHONE_RE.test(text)) return "contains_phone";
  }
  return null;
}

// ── Câu báo lỗi (FE giữ lời văn; BE chỉ trả `code`) ───────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  too_short: "Bình luận cần ít nhất 3 ký tự.",
  too_long: "Bình luận tối đa 2000 ký tự.",
  name_too_long: "Tên hiển thị tối đa 40 ký tự.",
  contains_link:
    "Bình luận không được chứa đường link. Hãy mô tả nguồn bằng chữ (ví dụ: “thông báo học phí trên web trường”).",
  contains_phone:
    "Bình luận không được chứa số điện thoại hay thông tin liên lạc.",
  turnstile_failed:
    "Chưa xác minh được bạn là người. Hãy tích lại ô xác minh rồi gửi.",
  parent_not_found: "Bình luận bạn trả lời không còn tồn tại.",
  thread_not_found: "Trang này không còn tồn tại.",
  invalid_thread: "Không gửi được bình luận ở trang này.",
  network:
    "Không gửi được — mạng có vấn đề. Nội dung vẫn được giữ, bấm “Gửi” lại.",
  invalid_token: "Không xoá được bình luận này.",
  delete_window_expired: "Đã quá 15 phút, không thể tự xoá nữa.",
  not_found: "Bình luận không còn tồn tại.",
};

export function errorMessage(code: string, retryAfterSeconds?: number): string {
  if (code === "rate_limited") {
    const minutes = Math.max(1, Math.ceil((retryAfterSeconds ?? 60) / 60));
    return `Bạn gửi hơi nhanh. Mỗi người tối đa 5 bình luận / 10 phút — thử lại sau ${minutes} phút.`;
  }
  return ERROR_MESSAGES[code] ?? "Có lỗi xảy ra, thử lại sau ít phút.";
}

// ── Thời gian ─────────────────────────────────────────────────────────────────────

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Vừa xong" / "5 phút trước" / "3 giờ trước" / "Hôm qua" / "4 ngày trước" / ngày. */
export function formatRelativeVi(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  if (diff < MINUTE) return "Vừa xong";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`;
  if (diff < 2 * DAY) return "Hôm qua";
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function formatFullVi(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ── Báo cáo ───────────────────────────────────────────────────────────────────────

export const REPORT_REASONS: { value: CommentReportReason; label: string }[] = [
  { value: "spam", label: "Quảng cáo / spam" },
  { value: "sai_lech", label: "Thông tin sai lệch về học phí" },
  { value: "xuc_pham", label: "Xúc phạm, quấy rối" },
  { value: "thong_tin_ca_nhan", label: "Lộ thông tin cá nhân" },
  { value: "khac", label: "Khác" },
];
