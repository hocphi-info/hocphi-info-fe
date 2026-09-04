// Skeleton shown while a results page is fetching. Server Component (no state) —
// Next renders it automatically via the sibling loading.tsx while page.tsx awaits.
export default function ResultsSkeleton() {
  return (
    <div
      className="mt-6 min-w-0 animate-pulse lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6"
      aria-hidden
    >
      {/* filter panel */}
      <div className="hidden lg:block">
        <div className="h-64 rounded-lg bg-surface-2" />
      </div>

      {/* results column */}
      <div className="mt-4 min-w-0 lg:mt-0">
        <div className="h-5 w-48 rounded bg-surface-2" />
        <div className="mt-2 h-4 w-72 rounded bg-surface-2" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
