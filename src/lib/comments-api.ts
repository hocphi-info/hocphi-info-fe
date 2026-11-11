// Gọi API bình luận TỪ TRÌNH DUYỆT (khác lib/api.ts — chạy trên server lúc render
// trang). Trình duyệt gọi thẳng api.hocphi.info qua CORS, không đi qua Worker.
//
// Lỗi luôn là `CommentApiError` có `code` (BE trả `{detail: {code, message}}`), để
// component chỉ cần `errorMessage(err.code)` (lib/comments.ts) ra câu tiếng Việt.

import { API_BASE } from "@/lib/api-base";
import type {
  CommentCreateIn,
  CommentCreated,
  CommentList,
  CommentReportReason,
  CommentSort,
} from "@/types/domain";

export class CommentApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
    this.name = "CommentApiError";
  }
}

async function toError(res: Response): Promise<CommentApiError> {
  try {
    const body = (await res.json()) as {
      detail?: { code?: string; retryAfterSeconds?: number } | unknown[];
    };
    const d = body.detail;
    if (d && !Array.isArray(d) && typeof d === "object" && d.code) {
      return new CommentApiError(d.code, res.status, d.retryAfterSeconds);
    }
  } catch {
    // body không phải JSON — rơi xuống mã chung bên dưới
  }
  return new CommentApiError(`http_${res.status}`, res.status);
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: init?.signal ?? AbortSignal.timeout(15_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new CommentApiError("network", 0);
  }
  if (!res.ok) throw await toError(res);
  return res;
}

// GET được thử lại (máy Fly có thể đang "thức dậy" sau khi ngủ, trả 403/5xx vài giây
// đầu — cùng lý do với apiFetch ở lib/api.ts). POST/DELETE KHÔNG thử lại: tránh gửi
// trùng bình luận.
const RETRYABLE = new Set([0, 403, 502, 503, 504]);

export async function listComments(
  thread: string,
  sort: CommentSort,
  offset = 0,
): Promise<CommentList> {
  const qs = new URLSearchParams({ thread, sort, offset: String(offset) });
  let last: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return (await (
        await send(`/api/v1/comments?${qs}`, { method: "GET" })
      ).json()) as CommentList;
    } catch (err) {
      last = err;
      if (!(err instanceof CommentApiError) || !RETRYABLE.has(err.status))
        break;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw last;
}

export async function createComment(
  input: CommentCreateIn,
): Promise<CommentCreated> {
  const res = await send("/api/v1/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (await res.json()) as CommentCreated;
}

export async function deleteComment(id: string, token: string): Promise<void> {
  await send(`/api/v1/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "X-Delete-Token": token },
  });
}

export async function reportComment(
  id: string,
  reason: CommentReportReason,
): Promise<{ hidden: boolean }> {
  const res = await send(`/api/v1/comments/${encodeURIComponent(id)}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return (await res.json()) as { hidden: boolean };
}

// ── Lưu trên trình duyệt (không có tài khoản) ─────────────────────────────────────
// Chỉ gọi trong effect / event handler — trên server không có `localStorage`.

const NAME_KEY = "hocphi:comment-name";
const TOKENS_KEY = "hocphi:comment-tokens";

export interface OwnComment {
  token: string;
  createdAt: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback; // chế độ ẩn danh / chặn storage: chạy tiếp không có tính năng nhớ
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // bỏ qua
  }
}

export function loadSavedName(): string {
  return readJson<string>(NAME_KEY, "");
}

export function saveName(name: string): void {
  writeJson(NAME_KEY, name);
}

/** Mã xoá của bình luận mình gửi, còn trong hạn 15 phút (tự dọn mã hết hạn). */
export function loadOwnComments(windowMs: number): Record<string, OwnComment> {
  const all = readJson<Record<string, OwnComment>>(TOKENS_KEY, {});
  const now = Date.now();
  const fresh = Object.fromEntries(
    Object.entries(all).filter(
      ([, v]) => now - new Date(v.createdAt).getTime() < windowMs,
    ),
  );
  if (Object.keys(fresh).length !== Object.keys(all).length) {
    writeJson(TOKENS_KEY, fresh);
  }
  return fresh;
}

export function saveOwnComment(id: string, own: OwnComment): void {
  writeJson(TOKENS_KEY, { ...readJson(TOKENS_KEY, {}), [id]: own });
}

export function forgetOwnComment(id: string): void {
  const all = readJson<Record<string, OwnComment>>(TOKENS_KEY, {});
  delete all[id];
  writeJson(TOKENS_KEY, all);
}
