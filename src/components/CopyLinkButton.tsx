"use client";

// Client island duy nhất của trang bài. Bấm → chép link sạch (không UTM) vào clipboard.
// Trình duyệt nhúng của Facebook/Threads (in-app browser) hay chặn `navigator.clipboard`,
// nên có 2 phương án dự phòng: `execCommand("copy")`, rồi cuối cùng hiện ô chứa link
// đã chọn sẵn để người dùng tự giữ-chép (plan D15).

import { useState } from "react";

type State = "idle" | "copied" | "manual";

function legacyCopy(text: string): boolean {
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(el);
  return ok;
}

export default function CopyLinkButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [state, setState] = useState<State>("idle");

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy(url);
    }
    setState(ok ? "copied" : "manual");
    if (ok) setTimeout(() => setState("idle"), 2000);
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={copy}
        className={className}
        data-umami-event="share-copy-link"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden
        >
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </svg>
        {state === "copied" ? "Đã sao chép" : "Sao chép link"}
      </button>
      {/* Vùng báo trạng thái cho trình đọc màn hình. */}
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Đã sao chép liên kết" : ""}
      </span>
      {state === "manual" ? (
        <input
          readOnly
          value={url}
          aria-label="Liên kết bài viết — nhấn giữ để sao chép"
          onFocus={(e) => e.currentTarget.select()}
          className="w-56 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink"
        />
      ) : null}
    </span>
  );
}
