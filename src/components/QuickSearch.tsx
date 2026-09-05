"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { API_BASE } from "@/lib/api-base";
import { setOne, writeParams } from "@/lib/url";
import type { MajorRow, SchoolRow, SearchHit } from "@/types/domain";

const MIN_LEN = 2;
const DEBOUNCE_MS = 250;
const MAX_HITS = 8;

// Client Component — the other kind of data fetching. This one runs in the
// BROWSER: `fetch` inside a `useEffect`, results parked in `useState`, and the
// component renders its own loading / empty states. Errors here do NOT reach
// error.tsx (that only catches errors thrown during render), so we swallow them
// into an empty result.
//
// Flutter analogy: initState + setState, with the useEffect cleanup playing the
// role of dispose().
//
// Placement: it lives in the results toolbar just above the table (see
// MajorResultsView), not in SiteHeader — it belongs with the page it searches.
// The parent wraps it in a width-constrained <div>; this component just fills it.
export default function QuickSearch() {
  const sp = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  // Results are tagged with the query they came from, so a stale response (or a
  // response for a query the user has since changed) is simply ignored at render
  // time — no flash of old hits.
  const [data, setData] = useState<{ q: string; hits: SearchHit[] } | null>(
    null,
  );
  // Explicit "user closed this" flag, tagged with the query it was dismissed
  // for (same trick as `data`/`fresh` below). Without it the dropdown had no
  // way to go away: `active` only depends on the query text, so it stayed
  // true forever — through clicks, blur, everything — until the input was
  // cleared. Tagging by query means typing again reopens it for free, with no
  // effect needed to "reset" the flag.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const trimmed = query.trim();
  const active = trimmed.length >= MIN_LEN;

  // Close on outside click. `active` (not `showDropdown`) gates the listener so
  // it also un-registers once the query is cleared, not just once dismissed.
  useEffect(() => {
    if (!active) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDismissedFor(trimmed);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [active, trimmed]);

  useEffect(() => {
    if (!active) return;

    // `ignore` guards against a race: if the user keeps typing, this effect is
    // cleaned up and re-run. A slow response from an earlier keystroke must not
    // win over a later one.
    let ignore = false;

    // Debounce: wait for a pause in typing before hitting the network. There is
    // no dedicated /api/search endpoint anymore — we ask the two list endpoints
    // in parallel (each filters its own entity by name via `?search=`) and merge
    // the results into the hit shape the dropdown renders.
    const timer = setTimeout(async () => {
      try {
        const q = encodeURIComponent(trimmed);
        const [majorRes, schoolRes] = await Promise.all([
          fetch(`${API_BASE}/api/majors?search=${q}`),
          fetch(`${API_BASE}/api/schools?search=${q}`),
        ]);
        const majorRows: MajorRow[] = majorRes.ok ? await majorRes.json() : [];
        const schoolRows: SchoolRow[] = schoolRes.ok
          ? await schoolRes.json()
          : [];

        const schoolHits: SearchHit[] = schoolRows.map((r) => ({
          kind: "school",
          slug: r.school.slug,
          name: r.school.name,
          shortName: r.school.shortName || undefined,
        }));

        // /api/majors returns one row PER PROGRAM, so a major taught at N
        // schools comes back N times — collapse to one hit per major slug.
        const seen = new Set<string>();
        const majorHits: SearchHit[] = [];
        for (const r of majorRows) {
          if (seen.has(r.major.slug)) continue;
          seen.add(r.major.slug);
          majorHits.push({
            kind: "major",
            slug: r.major.slug,
            name: r.major.name,
          });
        }

        // Schools before majors, capped — same shape the old endpoint returned.
        const hits = [...schoolHits, ...majorHits].slice(0, MAX_HITS);
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
  const showDropdown = active && dismissedFor !== trimmed;

  // Detail routes (S3/S4) don't exist yet (Week 4), so picking a hit narrows
  // the current table to that one school/major instead of navigating away —
  // same URL-is-state mechanism FilterPanel uses, so it updates instantly with
  // no server round-trip.
  function selectHit(hit: SearchHit) {
    let next = setOne(
      new URLSearchParams(sp.toString()),
      hit.kind === "school" ? "school" : "major",
      hit.slug,
    );
    next = setOne(next, hit.kind === "school" ? "major" : "school", null);
    writeParams(next, "push");
    setQuery(""); // clearing drops `active`, which hides the dropdown too
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setDismissedFor(trimmed);
        }}
        placeholder="Tìm trường / ngành…"
        aria-label="Tìm nhanh trường hoặc ngành"
        className="w-full rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink shadow-sm placeholder:text-ink-3"
      />

      {showDropdown && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {fresh === null && (
            <li className="px-3 py-2 text-sm text-ink-3">Đang tìm…</li>
          )}

          {fresh !== null && fresh.length === 0 && (
            <li className="px-3 py-2 text-sm text-ink-3">Không tìm thấy</li>
          )}

          {fresh?.map((hit) => (
            <li key={`${hit.kind}-${hit.slug}`}>
              <button
                type="button"
                onClick={() => selectHit(hit)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
              >
                <span className="truncate">
                  {hit.name}
                  {hit.shortName ? ` · ${hit.shortName}` : ""}
                </span>
                <span className="shrink-0 text-xs text-ink-3">
                  {hit.kind === "school" ? "Trường" : "Ngành"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
