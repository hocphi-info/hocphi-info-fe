import ResultsSkeleton from "@/components/ResultsSkeleton";

// Shown automatically while app/truong/page.tsx awaits its data.
export default function Loading() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="h-8 w-72 animate-pulse rounded bg-surface-2" />
      <ResultsSkeleton />
    </main>
  );
}
