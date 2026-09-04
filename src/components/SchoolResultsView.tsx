"use client";

// Client Component — the interactive shell for S2 (/truong). Mirror of
// MajorResultsView, with one structural difference that the Week 3 plan calls
// out: it receives the FULL MajorRow[] (not SchoolRow[]) and groups it into
// per-school stats HERE, on the client. That is what makes the "cơ sở tính
// khoảng" radio (R6) and the "có đào tạo nhóm ngành" filter possible — a
// pre-baked SchoolRow[] from the API has no per-program data to recompute from.
//
// Pipeline: MajorRow[]  --deriveSchoolRows(basisTracks)-->  SchoolRow[]
//                       --filterSchoolRows(f, allMajorRows)-->  filtered
//                       --sortSchoolRows(f)-->  visible

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { MajorRow } from "@/types/domain";
import {
  deriveSchoolRows,
  describeSchoolFilters,
  filterSchoolRows,
  parseSchoolFilters,
  schoolFilterChips,
  sortSchoolRows,
} from "@/lib/filters";
import FilterPanel from "@/components/FilterPanel";
import FilterChips from "@/components/FilterChips";
import ResultsSummary from "@/components/ResultsSummary";
import EmptyResults from "@/components/EmptyResults";
import SchoolRangeChart from "@/components/SchoolRangeChart";
import DismissibleCallout from "@/components/DismissibleCallout";
import SchoolResultsTable from "@/components/SchoolResultsTable";

export default function SchoolResultsView({ rows }: { rows: MajorRow[] }) {
  const sp = useSearchParams();
  const filters = useMemo(() => parseSchoolFilters(sp), [sp]);

  const visible = useMemo(() => {
    const grouped = deriveSchoolRows(rows, filters.basisTracks);
    return sortSchoolRows(filterSchoolRows(grouped, rows, filters), filters);
  }, [rows, filters]);

  return (
    <div className="mt-6 min-w-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
      <FilterPanel screen="truong" />

      <section className="mt-4 min-w-0 lg:mt-0">
        <ResultsSummary
          count={visible.length}
          noun="trường"
          description={describeSchoolFilters(filters)}
        />

        <div className="mt-3">
          <FilterChips chips={schoolFilterChips(filters)} />
        </div>

        <div className="mt-3">
          <DismissibleCallout title="Vì sao cần khoảng Min–Max?">
            Một trường có thể dạy ngành xã hội học phí ~15 tr/năm và Răng – Hàm
            – Mặt ~160 tr/năm — chênh 3–5 lần. Một con số trung bình sẽ che mất
            điều đó, nên ta hiển thị khoảng thấp nhất – cao nhất kèm trung vị.
          </DismissibleCallout>
        </div>

        {visible.length === 0 ? (
          <div className="mt-4">
            <EmptyResults />
          </div>
        ) : (
          <>
            <div className="mt-4">
              <SchoolRangeChart
                rows={visible}
                basisAll={filters.basisTracks.length > 1}
              />
            </div>
            <div className="mt-4">
              <SchoolResultsTable
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
          Xem thêm trường
        </button>
      </section>
    </div>
  );
}
