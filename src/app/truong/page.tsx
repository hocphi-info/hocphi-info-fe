import { Suspense } from "react";
import { fetchSchoolRows } from "@/lib/api";
import ViewModeToggle from "@/components/ViewModeToggle";
import FilterPanel from "@/components/FilterPanel";
import DismissibleCallout from "@/components/DismissibleCallout";
import SchoolResultsTable from "@/components/SchoolResultsTable";
import ResultsSkeleton from "@/components/ResultsSkeleton";

// Server Component. See app/nganh/page.tsx.
//
// NOTE (Week 3, Phase 2): FilterPanel is now a client component using
// useSearchParams, so this route needs `await searchParams` + <Suspense> too.
// The by-school interactive view (filtering, sort, Min–Max chart, deriving
// SchoolRow[] from MajorRow[] for the "cơ sở tính khoảng" radio) lands in
// Phase 3 — until then the panel is live but the list below it is not yet wired.
export default async function TruongPage({
  searchParams,
}: PageProps<"/truong">) {
  await searchParams;
  const rows = await fetchSchoolRows();

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Tra cứu học phí theo trường
        </h1>
        <ViewModeToggle current="truong" />
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <div className="mt-6 min-w-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <FilterPanel screen="truong" />

          <section className="mt-4 min-w-0 lg:mt-0">
            <div>
              <p className="font-medium text-ink">
                {rows.length} trường phù hợp
              </p>
              <p className="text-sm text-ink-3">
                Khoảng học phí tính trên các ngành hệ đại trà
              </p>
            </div>

            <div className="mt-3">
              <DismissibleCallout title="Vì sao cần khoảng Min–Max?">
                Một trường có thể dạy ngành xã hội học phí ~15 tr/năm và Răng –
                Hàm – Mặt ~160 tr/năm — chênh 3–5 lần. Một con số trung bình sẽ
                che mất điều đó, nên ta hiển thị khoảng thấp nhất – cao nhất kèm
                trung vị.
              </DismissibleCallout>
            </div>

            <div className="mt-4">
              <SchoolResultsTable rows={rows} />
            </div>

            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-ink-3"
            >
              Xem thêm trường
            </button>
          </section>
        </div>
      </Suspense>
    </main>
  );
}
