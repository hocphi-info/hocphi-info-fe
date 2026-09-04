"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { SearchHit } from "@/types/domain";

const MIN_LEN = 2;
const DEBOUNCE_MS = 250;

// Client Component — the other kind of data fetching. This one runs in the
// BROWSER: `fetch` inside a `useEffect`, results parked in `useState`, and the
// component renders its own loading / empty states. Errors here do NOT reach
// error.tsx (that only catches errors thrown during render), so we swallow them
// into an empty result.
//
// Flutter analogy: initState + setState, with the useEffect cleanup playing the
// role of dispose().
export default function QuickSearch() {
  const [query, setQuery] = useState("");
  // Results are tagged with the query they came from, so a stale response (or a
  // response for a query the user has since changed) is simply ignored at render
  // time — no flash of old hits.
  const [data, setData] = useState<{ q: string; hits: SearchHit[] } | null>(
    null,
  );

  const trimmed = query.trim();
  const active = trimmed.length >= MIN_LEN;

  useEffect(() => {
    if (!active) return;

    // `ignore` guards against a race: if the user keeps typing, this effect is
    // cleaned up and re-run. A slow response from an earlier keystroke must not
    // win over a later one.
    let ignore = false;

    // Debounce: wait for a pause in typing before hitting the network.
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const hits: SearchHit[] = res.ok ? await res.json() : [];
        if (!ignore) setData({ q: trimmed, hits });
      } catch {
        if (!ignore) setData({ q: trimmed, hits: [] });
      }
    }, DEBOUNCE_MS);

    // Cleanup: runs before the next effect and on unmount.
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [trimmed, active]);

  const fresh = data?.q === trimmed ? data.hits : null;

  return (
    <div className="relative ml-auto hidden w-full max-w-xs sm:block">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm trường / ngành…"
        aria-label="Tìm nhanh trường hoặc ngành"
        className="w-full rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm text-ink placeholder:text-ink-3"
      />

      {active && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {fresh === null && (
            <li className="px-3 py-2 text-sm text-ink-3">Đang tìm…</li>
          )}

          {fresh !== null && fresh.length === 0 && (
            <li className="px-3 py-2 text-sm text-ink-3">Không tìm thấy</li>
          )}

          {fresh?.map((hit) => (
            <li key={`${hit.kind}-${hit.slug}`}>
              {/* Detail routes (S3/S4) arrive in Week 4 — href is a placeholder. */}
              <Link
                href="#"
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
              >
                <span className="truncate">
                  {hit.name}
                  {hit.shortName ? ` · ${hit.shortName}` : ""}
                </span>
                <span className="shrink-0 text-xs text-ink-3">
                  {hit.kind === "school" ? "Trường" : "Ngành"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
