import ResultsSkeleton from "@/components/ResultsSkeleton";

// Next shows this automatically while app/nganh/page.tsx is awaiting its data.
// It wraps page.tsx in a <Suspense> boundary behind the scenes — no imperative
// spinner needed.
export default function Loading() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="h-8 w-72 animate-pulse rounded bg-surface-2" />
      <ResultsSkeleton />
    </main>
  );
}
