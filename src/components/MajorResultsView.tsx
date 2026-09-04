"use client";

// Client Component — the interactive shell for S1 (/nganh). This is where "URL is
// state" lives: it reads useSearchParams(), derives the visible rows with the
// pure helpers from lib/filters, and passes them down. FilterPanel /
// SortableHeader (inside the table) / FilterChips write the URL; this component
// reacts to it.
//
// It receives the FULL row list once (fetched by the Server page) and never
// re-fetches — filtering/sorting is all in-memory, so changing a filter is
// instant with no network request (spec F3).
//
// Learning note (vs Flutter): `visible` is DERIVED state — we don't store it and
// call setState; we recompute it on every render from (rows, searchParams),
// the same way you'd compute a filtered list inside build() instead of caching
// it in a field.

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { MajorRow } from "@/types/domain";
import {
  describeMajorFilters,
  filterMajorRows,
  majorFilterChips,
  parseMajorFilters,
  sortMajorRows,
} from "@/lib/filters";
import FilterPanel from "@/components/FilterPanel";
import FilterChips from "@/components/FilterChips";
import QuickSearch from "@/components/QuickSearch";
import ResultsSummary from "@/components/ResultsSummary";
import EmptyResults from "@/components/EmptyResults";
import DistributionStrip from "@/components/DistributionStrip";
import DismissibleCallout from "@/components/DismissibleCallout";
import CompareCountButton from "@/components/CompareCountButton";
import MajorResultsTable from "@/components/MajorResultsTable";

export default function MajorResultsView({ rows }: { rows: MajorRow[] }) {
  const sp = useSearchParams();
  const filters = useMemo(() => parseMajorFilters(sp), [sp]);
  const visible = useMemo(
    () => sortMajorRows(filterMajorRows(rows, filters), filters),
    [rows, filters],
  );

  return (
    <div className="mt-6 min-w-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
      <FilterPanel screen="nganh" />

      <section className="mt-4 min-w-0 lg:mt-0">
        <ResultsSummary
          count={visible.length}
          noun="ngành – trường"
          description={describeMajorFilters(filters)}
        />

        <div className="mt-3">
          <FilterChips chips={majorFilterChips(filters)} />
        </div>

        <div className="mt-3">
          <DismissibleCallout title="Vì sao dùng trung vị theo hệ?">
            Học phí các hệ đào tạo (đại trà, chất lượng cao, tiên tiến, quốc tế)
            chênh nhau 3–5 lần. Gộp chung sẽ ra một con số vô nghĩa, nên mọi
            phép trung vị đều tính riêng trong từng hệ.
          </DismissibleCallout>
        </div>

        {visible.length === 0 ? (
          <div className="mt-4">
            <EmptyResults />
          </div>
        ) : (
          <>
            <div className="mt-4">
              <DistributionStrip rows={visible} />
            </div>
            {/* Toolbar sitting right on top of the table: quick search on the
                left, "So sánh" on the right. */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="w-full sm:max-w-xs">
                <QuickSearch />
              </div>
              <CompareCountButton />
            </div>
            <div className="mt-3">
              <MajorResultsTable
                rows={visible}
                sort={filters.sort}
                dir={filters.dir}
              />
            </div>
          </>
        )}

        <button
          type="button"
          disabled
          className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-ink-3"
        >
          {/* TODO Tuần 4+: phân trang khi có BE + dữ liệu 50 trường */}
          Xem thêm kết quả
        </button>
      </section>
    </div>
  );
}
