"use client";

// Client Component — needs state (the "copied" flag) and a click handler.
// Shows a code/URL block with a copy button. Clipboard access can be denied
// (insecure context, permissions). Then the text is selected for the user and
// the button asks for Ctrl+C: the button is a convenience, never the only way
// to get the text.

import { useRef, useState } from "react";

export default function CopyableCode({
  text,
  label,
}: {
  text: string;
  /** Accessible name for the block, e.g. "Địa chỉ máy chủ MCP". */
  label: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const codeRef = useRef<HTMLElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      // Denied: select the text so Ctrl/Cmd+C is one keystroke away.
      if (codeRef.current) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("manual");
    }
    setTimeout(() => setState("idle"), 3000);
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-2">
      <pre
        aria-label={label}
        className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all px-2 py-1 font-mono text-xs leading-relaxed text-ink sm:text-sm"
      >
        <code ref={codeRef}>{text}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-accent-border hover:text-accent-strong"
      >
        {state === "copied"
          ? "Đã sao chép"
          : state === "manual"
            ? "Nhấn Ctrl+C"
            : "Sao chép"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Đã sao chép vào bộ nhớ tạm"
          : state === "manual"
            ? "Không tự sao chép được, đã chọn sẵn văn bản, hãy nhấn Ctrl+C"
            : ""}
      </span>
    </div>
  );
}
