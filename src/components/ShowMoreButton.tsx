// Presentational — the "Xem thêm {còn lại} …" button under the results table on
// S1/S2. Replaces the Week 1 placeholder `<button disabled>`. No "use client":
// it is only rendered by MajorResultsView / SchoolResultsView (already Client
// Components) and takes its handler as a prop — same setup as ResultsSummary
// (a Server Component used inside the client results tree).
//
// The parent owns the "how many rows shown" state (useState, not the URL — it is
// ephemeral view state, like FilterPanel's `mobileOpen`, not part of the
// filter/sort state that lives in the query string).

export default function ShowMoreButton({
  remaining,
  noun,
  onClick,
}: {
  /** How many filtered rows are still hidden. */
  remaining: number;
  /** "kết quả" (S1) or "trường" (S2). */
  noun: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-ink-2 hover:bg-surface-2"
    >
      Xem thêm {remaining} {noun}
    </button>
  );
}
