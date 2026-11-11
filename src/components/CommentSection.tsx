"use client";

// Khối bình luận ẩn danh — "đảo client" (client island) duy nhất được thêm vào 6 trang.
// Trang vẫn là Server Component (HTML, SEO, metadata không đổi); chỉ khối này chạy
// trên trình duyệt và tự gọi API SAU khi trang hiển thị (see plan R2).
//
// Đọc theo thứ tự:
//   1. `reducer` — MỌI thay đổi danh sách bình luận đi qua đây (giống Bloc: event → state).
//   2. Effect tải lười — chỉ gọi API khi khối sắp lọt vào màn hình.
//   3. Các handler (gửi / xoá / báo cáo) → dispatch action tương ứng.
//   4. JSX: tiêu đề → form → cây <CommentItem> (đệ quy) → "Xem thêm".

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  DELETE_WINDOW_MS,
  buildTree,
  commentAnchor,
  errorMessage,
  pruneHidden,
} from "@/lib/comments";
import {
  CommentApiError,
  deleteComment,
  forgetOwnComment,
  listComments,
  loadOwnComments,
  reportComment,
  saveOwnComment,
  type OwnComment,
} from "@/lib/comments-api";
import type {
  CommentCreated,
  CommentList,
  CommentOut,
  CommentReportReason,
  CommentSort,
} from "@/types/domain";
import {
  CommentThreadContext,
  type CommentThreadValue,
} from "@/components/comment-context";
import CommentForm from "@/components/CommentForm";
import CommentItem from "@/components/CommentItem";
import ReportDialog from "@/components/ReportDialog";

// ── State + reducer ───────────────────────────────────────────────────────────

interface State {
  status: "idle" | "loading" | "ready" | "error";
  sort: CommentSort;
  comments: CommentOut[];
  total: number;
  nextOffset: number | null;
  loadingMore: boolean;
}

type Action =
  | { type: "loading"; sort: CommentSort }
  | { type: "loaded"; data: CommentList; append: boolean }
  | { type: "failed" }
  | { type: "loadingMore" }
  | { type: "added"; comment: CommentOut }
  | { type: "gone"; id: string }; // tự xoá / bị ẩn do báo cáo

const initialState: State = {
  status: "idle",
  sort: "newest",
  comments: [],
  total: 0,
  nextOffset: null,
  loadingMore: false,
};

// Hàm thuần: (state cũ, action) → state mới. Không gọi API, không đụng DOM ở đây.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...initialState, status: "loading", sort: action.sort };
    case "loaded":
      return {
        ...state,
        status: "ready",
        loadingMore: false,
        total: action.data.total,
        nextOffset: action.data.nextOffset,
        comments: action.append
          ? [...state.comments, ...action.data.comments]
          : action.data.comments,
      };
    case "failed":
      // Lỗi khi "Xem thêm" thì giữ danh sách đang có; lỗi lần đầu → màn lỗi.
      return state.status === "ready"
        ? { ...state, loadingMore: false }
        : { ...state, status: "error" };
    case "loadingMore":
      return { ...state, loadingMore: true };
    case "added": {
      const c = action.comment;
      // Gốc mới + đang xem "Mới nhất" → lên đầu. Còn lại (trả lời, hoặc "Cũ nhất")
      // → cuối danh sách; buildTree tự gắn trả lời vào đúng cha.
      const toTop = c.parentId === null && state.sort === "newest";
      return {
        ...state,
        total: state.total + 1,
        comments: toTop ? [c, ...state.comments] : [...state.comments, c],
      };
    }
    case "gone":
      return {
        ...state,
        total: Math.max(0, state.total - 1),
        comments: pruneHidden(
          state.comments.map((c) =>
            c.id === action.id
              ? {
                  ...c,
                  isHidden: true,
                  body: null,
                  authorName: null,
                  authorTag: null,
                }
              : c,
          ),
        ),
      };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommentSection({
  threadKey,
  title,
  subtitle = "Hỏi đáp và chia sẻ kinh nghiệm thực tế. Bình luận là ý kiến cá nhân — số liệu chính thức xem ở phía trên và nguồn của trường.",
  className = "",
}: {
  /** Khoá chuỗi, vd "truong/ueh" — khớp regex ở BE (app/comments_guard.py). */
  threadKey: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sectionRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => Date.now());
  // Mã tự xoá của bình luận mình gửi (localStorage). Khởi tạo "lười" bằng hàm: trên
  // server không có localStorage → {} (loadOwnComments tự bắt lỗi); cây bình luận chỉ
  // hiện sau khi tải ở client nên không lệch HTML lúc hydrate.
  const [ownComments, setOwnComments] = useState<Record<string, OwnComment>>(
    () => loadOwnComments(DELETE_WINDOW_MS),
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const load = useCallback(
    async (sort: CommentSort) => {
      dispatch({ type: "loading", sort });
      try {
        dispatch({
          type: "loaded",
          data: await listComments(threadKey, sort),
          append: false,
        });
      } catch {
        dispatch({ type: "failed" });
      }
    },
    [threadKey],
  );

  // (2) Tải lười: chỉ gọi API khi khối còn cách màn hình ~600px — người không cuộn
  // tới cuối trang thì không tốn request (và không đánh thức máy Fly). Mở bằng link
  // "#binh-luan…" thì tải ngay. IntersectionObserver luôn gọi callback 1 lần ngay sau
  // `observe()` (bất đồng bộ), nên trường hợp có hash cũng đi qua cùng một đường.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const fromLink = location.hash.startsWith("#binh-luan");
    const io = new IntersectionObserver(
      (entries) => {
        if (fromLink || entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void load("newest");
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  // Đồng hồ cho "5 phút trước" + hạn tự xoá (render không được gọi Date.now()).
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Link "#binh-luan-<id>": sau lần tải đầu, cuộn tới + nhấn nền bình luận đó (R16).
  // Chỉ làm 1 lần; setState đặt trong setTimeout (callback) chứ không gọi thẳng
  // trong thân effect.
  const scrolledToHash = useRef(false);
  useEffect(() => {
    if (state.status !== "ready" || scrolledToHash.current) return;
    scrolledToHash.current = true;
    const id = location.hash.match(/^#binh-luan-(.+)$/)?.[1];
    if (!id || !state.comments.some((c) => c.id === id)) return;
    const show = setTimeout(() => {
      document
        .getElementById(commentAnchor(id))
        ?.scrollIntoView({ block: "center" });
      setHighlightedId(id);
    }, 0);
    const hide = setTimeout(() => setHighlightedId(null), 4000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [state.status, state.comments]);

  async function loadMore() {
    if (state.nextOffset === null) return;
    dispatch({ type: "loadingMore" });
    try {
      const data = await listComments(threadKey, state.sort, state.nextOffset);
      dispatch({ type: "loaded", data, append: true });
    } catch {
      dispatch({ type: "failed" });
    }
  }

  // (3) Handlers — đưa vào Context để CommentItem ở mọi cấp gọi được.
  const onPosted = useCallback((created: CommentCreated) => {
    const c = created.comment;
    const own = { token: created.deleteToken, createdAt: c.createdAt };
    saveOwnComment(c.id, own);
    setOwnComments((prev) => ({ ...prev, [c.id]: own }));
    setReplyingTo(null);
    setNow(Date.now());
    dispatch({ type: "added", comment: c });
    setHighlightedId(c.id);
  }, []);

  const onDelete = useCallback(
    async (id: string) => {
      const own = ownComments[id];
      if (!own) return;
      try {
        await deleteComment(id, own.token);
        dispatch({ type: "gone", id });
      } catch (err) {
        alert(
          errorMessage(err instanceof CommentApiError ? err.code : "network"),
        );
      }
      forgetOwnComment(id);
      setOwnComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [ownComments],
  );

  async function submitReport(reason: CommentReportReason): Promise<string> {
    const id = reportingId;
    if (!id) return "";
    try {
      const { hidden } = await reportComment(id, reason);
      if (hidden) dispatch({ type: "gone", id });
      return hidden
        ? "Cảm ơn bạn. Bình luận đã bị ẩn chờ xem xét."
        : "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.";
    } catch (err) {
      return errorMessage(
        err instanceof CommentApiError ? err.code : "network",
      );
    }
  }

  const tree = useMemo(() => buildTree(state.comments), [state.comments]);
  const ctx: CommentThreadValue = useMemo(
    () => ({
      threadKey,
      now,
      byId: new Map(state.comments.map((c) => [c.id, c])),
      ownComments,
      replyingTo,
      setReplyingTo,
      highlightedId,
      onPosted,
      onDelete,
      onReport: setReportingId,
    }),
    [
      threadKey,
      now,
      state.comments,
      ownComments,
      replyingTo,
      highlightedId,
      onPosted,
      onDelete,
    ],
  );

  const headingId = `binh-luan-tieu-de-${threadKey.replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section
      ref={sectionRef}
      id="binh-luan"
      aria-labelledby={headingId}
      className={`mt-12 scroll-mt-20 border-t border-rule pt-8 ${className}`}
    >
      {/* (4) Tiêu đề + sắp xếp */}
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
        <h2 id={headingId} className="text-xl font-bold text-ink">
          {title}
        </h2>
        {state.status === "ready" ? (
          <span className="text-sm text-ink-3">· {state.total} bình luận</span>
        ) : null}
        <div
          role="group"
          aria-label="Sắp xếp bình luận"
          className="ml-auto inline-flex overflow-hidden rounded-lg border border-border bg-surface text-[13px] font-semibold"
        >
          {(
            [
              ["newest", "Mới nhất"],
              ["oldest", "Cũ nhất"],
            ] as const
          ).map(([value, text], i) => (
            <button
              key={value}
              type="button"
              aria-pressed={state.sort === value}
              disabled={state.status === "loading"}
              onClick={() => state.sort !== value && load(value)}
              className={`px-3 py-1.5 ${i ? "border-l border-border" : ""} ${
                state.sort === value
                  ? "bg-accent-bg text-accent-strong"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{subtitle}</p>

      <CommentThreadContext.Provider value={ctx}>
        <div className="mt-4">
          <CommentForm threadKey={threadKey} onPosted={onPosted} />
        </div>

        <div
          className="mt-4"
          aria-live="polite"
          aria-busy={state.status === "loading"}
        >
          {state.status === "idle" || state.status === "loading" ? (
            <CommentSkeleton />
          ) : state.status === "error" ? (
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-ink-2">
              Không tải được bình luận.{" "}
              <button
                type="button"
                onClick={() => load(state.sort)}
                className="font-semibold text-accent-ink underline underline-offset-2"
              >
                Thử lại
              </button>
            </div>
          ) : tree.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-6 text-center">
              <b className="text-sm text-ink">Chưa có bình luận nào</b>
              <span className="text-[13px] text-ink-3">
                Hãy là người đầu tiên hỏi hoặc chia sẻ kinh nghiệm về học phí ở
                đây.
              </span>
            </div>
          ) : (
            <div>
              {tree.map((node) => (
                <CommentItem key={node.comment.id} node={node} />
              ))}
            </div>
          )}
        </div>

        {state.status === "ready" && state.nextOffset !== null ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={state.loadingMore}
              className="h-10 w-full rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink hover:border-accent-border sm:w-auto disabled:opacity-60"
            >
              {state.loadingMore ? "Đang tải…" : "Xem thêm bình luận"}
            </button>
          </div>
        ) : null}
      </CommentThreadContext.Provider>

      {reportingId ? (
        <ReportDialog
          key={reportingId}
          open
          onClose={() => setReportingId(null)}
          onSubmit={submitReport}
        />
      ) : null}
    </section>
  );
}

function CommentSkeleton() {
  return (
    <div className="space-y-5 pt-2" aria-label="Đang tải bình luận">
      {[0.95, 0.7].map((w, i) => (
        <div key={i} className="flex gap-2.5">
          <span className="h-[30px] w-[30px] shrink-0 rounded-full bg-surface-2" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-2.5 w-1/4 rounded bg-surface-2" />
            <div
              className="h-2.5 rounded bg-surface-2"
              style={{ width: `${w * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
