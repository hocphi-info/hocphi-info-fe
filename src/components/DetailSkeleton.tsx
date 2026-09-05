// Skeleton for the two Week 4 detail routes (F6, F7) — simpler than
// ResultsSkeleton (no filter panel/list rows, just a title + a couple of
// card-shaped blocks matching the real page's rhythm).
export default function DetailSkeleton() {
  return (
    <div className="mt-2 animate-pulse space-y-4" aria-hidden>
      <div className="h-4 w-40 rounded bg-surface-2" />
      <div className="h-8 w-72 rounded bg-surface-2" />
      <div className="h-48 rounded-xl bg-surface-2" />
      <div className="h-48 rounded-xl bg-surface-2" />
    </div>
  );
}
