// Client-only helpers for putting filter/sort state onto the URL WITHOUT a
// server round-trip.
//
// The key fact (Next 16 docs, "Native History API" in
// getting-started/linking-and-navigating): window.history.pushState /
// replaceState "integrate into the Next.js Router", so calling them updates the
// URL *and* makes useSearchParams() re-render — but it does NOT re-run the
// server. That's exactly what spec F3 wants: "lọc phía client, phản hồi tức thì".
//
// If we used router.push() instead (the pattern in the interactive-apps guide),
// every filter click would fetch a fresh RSC payload from the server. Correct for
// apps whose data lives on the server; wrong for us — we already hold the full
// list in the client.
//
// Learning note (vs Flutter): pushState ≈ Navigator.push (new history entry, Back
// works), replaceState ≈ Navigator.pushReplacement (no new entry). Use push for
// discrete actions (checkbox, sort) and replace for the range slider, so
// dragging it 10 steps doesn't create 10 Back-stops.

type WriteMode = "push" | "replace";

/**
 * Write `params` to the current URL's query string.
 * Empty params → bare pathname (so a cleared filter set gives a clean `/nganh`).
 */
export function writeParams(
  params: URLSearchParams,
  mode: WriteMode = "push",
): void {
  const qs = params.toString();
  const url = qs ? `?${qs}` : window.location.pathname;
  if (mode === "push") {
    window.history.pushState(null, "", url);
  } else {
    window.history.replaceState(null, "", url);
  }
}

/**
 * Toggle one value inside a repeated-key param (city, group, track, cat).
 * Returns a fresh URLSearchParams — does not touch the input.
 */
export function toggleMulti(
  current: URLSearchParams,
  key: string,
  value: string,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  const values = next.getAll(key);
  next.delete(key);
  const after = values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
  after.forEach((v) => next.append(key, v));
  return next;
}

/** Set (or, when `value` is null/empty, delete) a single-valued param. */
export function setOne(
  current: URLSearchParams,
  key: string,
  value: string | null | undefined,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  if (value == null || value === "") next.delete(key);
  else next.set(key, value);
  return next;
}

/** Remove one chip: drop a specific repeated value, or the whole key. */
export function removeParam(
  current: URLSearchParams,
  key: string,
  value?: string,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  if (value == null) {
    next.delete(key);
    return next;
  }
  const kept = next.getAll(key).filter((v) => v !== value);
  next.delete(key);
  kept.forEach((v) => next.append(key, v));
  return next;
}
