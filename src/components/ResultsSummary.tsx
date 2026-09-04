// Server Component — "{n} … phù hợp" + the "bộ lọc đang áp" line. The description
// string is derived from the current filters (R10), no longer hard-coded. Renders
// on the server on first load and re-renders on the client whenever the parent
// (MajorResultsView) re-renders from a URL change.

export default function ResultsSummary({
  count,
  noun,
  description,
}: {
  count: number;
  /** e.g. "ngành – trường" or "trường". */
  noun: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-medium text-ink">
        {count} {noun} phù hợp
      </p>
      <p className="text-base text-ink-3">{description}</p>
    </div>
  );
}
