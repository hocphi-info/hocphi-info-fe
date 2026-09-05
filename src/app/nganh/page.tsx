import { Suspense } from "react";
import { fetchMajorRows } from "@/lib/api";
import ViewModeToggle from "@/components/ViewModeToggle";
import CompareTray from "@/components/CompareTray";
import MajorResultsView from "@/components/MajorResultsView";
import ResultsSkeleton from "@/components/ResultsSkeleton";

// Server Component. It fetches the FULL row list (as in Week 2) and hands it to
// the client MajorResultsView, which does all filtering/sorting from the URL.
//
// Why `await searchParams` even though we don't read a value here: touching it
// opts the route into dynamic rendering, so useSearchParams() inside
// MajorResultsView resolves to the real query during SSR — the first paint is
// already filtered, not an empty list that fills in after hydration (R2).
//
// Why <Suspense>: useSearchParams() makes its subtree client-render up to the
// nearest Suspense boundary during prerender. Without one, `next build` fails
// ("Missing Suspense boundary with useSearchParams") — and `next dev` does NOT
// warn, so the build is the real gate.
export default async function NganhPage({ searchParams }: PageProps<"/nganh">) {
  await searchParams;
  const rows = await fetchMajorRows();

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Tra cứu học phí theo ngành
        </h1>
        <ViewModeToggle current="nganh" />
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <MajorResultsView rows={rows} />
      </Suspense>
      <CompareTray />
    </main>
  );
}
