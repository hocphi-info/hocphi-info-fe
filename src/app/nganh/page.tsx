import { fetchMajorRows } from "@/lib/api";
import ViewModeToggle from "@/components/ViewModeToggle";
import FilterPanel from "@/components/FilterPanel";
import SortDropdown from "@/components/SortDropdown";
import DismissibleCallout from "@/components/DismissibleCallout";
import CompareTray from "@/components/CompareTray";
import CompareCountButton from "@/components/CompareCountButton";
import MajorResultsTable from "@/components/MajorResultsTable";

// Server Component (no "use client"). The `async` function fetches on the server
// and blocks rendering until the data arrives — Next shows loading.tsx meanwhile,
// and a thrown error lands in error.tsx. Nothing below `return` changed from Week
// 1: the component tree only receives plain data via props.
export default async function NganhPage() {
  const rows = await fetchMajorRows();

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Tra cứu học phí theo ngành
        </h1>
        <ViewModeToggle current="nganh" />
      </div>

      <CompareTray>
        <div className="mt-6 min-w-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <FilterPanel screen="nganh" />

          <section className="mt-4 min-w-0 lg:mt-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">
                  {rows.length} ngành – trường phù hợp
                </p>
                <p className="text-sm text-ink-3">
                  Bộ lọc: tất cả thành phố · tất cả nhóm ngành
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SortDropdown />
                <CompareCountButton />
              </div>
            </div>

            <div className="mt-3">
              <DismissibleCallout title="Vì sao dùng trung vị theo hệ?">
                Học phí các hệ đào tạo (đại trà, chất lượng cao, tiên tiến, quốc
                tế) chênh nhau 3–5 lần. Gộp chung sẽ ra một con số vô nghĩa, nên
                mọi phép trung vị đều tính riêng trong từng hệ.
              </DismissibleCallout>
            </div>

            <div className="mt-4">
              <MajorResultsTable rows={rows} />
            </div>

            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-ink-3"
            >
              Xem thêm kết quả
            </button>
          </section>
        </div>
      </CompareTray>
    </main>
  );
}
