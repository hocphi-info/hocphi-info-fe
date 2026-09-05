import type { SchoolRow } from "@/types/domain";
import type { SchoolFilters } from "@/lib/filters";
import { formatMillions } from "@/lib/format";
import SchoolTypeBadge from "@/components/SchoolTypeBadge";
import SchoolLogo from "@/components/SchoolLogo";
import SortableHeader from "@/components/SortableHeader";
import RowLink from "@/components/RowLink";

// Server Component — S2 result list, matching the S1 table redesign: a card
// wrapper, sortable column headers (SortableHeader — Client leaves). Only the
// chevron (RowLink) in the last cell opens the detail route, not the whole <tr>,
// so row text stays selectable/copyable. Columns follow ../yeu-cau-san-pham.md
// §6/S2. A school with a single major shows one number + a "mới có 1 ngành" note.

const SORT_DEFAULT = "min" as const;

function ariaSort(
  isActive: boolean,
  dir: SchoolFilters["dir"],
): "ascending" | "descending" | "none" {
  if (!isActive) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function RangeCell({
  amount,
  majorName,
}: {
  amount: number;
  majorName: string;
}) {
  return (
    <div>
      <div className="tabular-nums text-ink">{formatMillions(amount)}</div>
      <div className="text-sm text-ink-3">{majorName}</div>
    </div>
  );
}

export default function SchoolResultsTable({
  rows,
  sort,
  dir,
}: {
  rows: SchoolRow[];
  sort: SchoolFilters["sort"];
  dir: SchoolFilters["dir"];
}) {
  return (
    <>
      {/* Desktop table — wrapped in a card, same as MajorResultsTable. */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)] lg:block">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-ink-3">
              <th
                scope="col"
                aria-sort={ariaSort(sort === "name", dir)}
                className="py-2 pl-4 pr-3 font-medium"
              >
                <SortableHeader
                  sortKey="name"
                  label="Trường"
                  active={sort === "name"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                />
              </th>
              <th scope="col" className="w-16 px-3 py-2 text-right font-medium">
                Số ngành
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "min", dir)}
                className="w-40 px-3 py-2 font-medium"
              >
                <SortableHeader
                  sortKey="min"
                  label="Thấp nhất"
                  active={sort === "min"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "median", dir)}
                className="w-24 px-3 py-2 text-right font-medium"
              >
                <SortableHeader
                  sortKey="median"
                  label="Trung vị"
                  active={sort === "median"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                  align="right"
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "max", dir)}
                className="w-40 px-3 py-2 font-medium"
              >
                <SortableHeader
                  sortKey="max"
                  label="Cao nhất"
                  active={sort === "max"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                />
              </th>
              <th scope="col" className="w-24 px-3 py-2 font-medium">
                Tăng/năm
              </th>
              <th scope="col" className="w-12 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ school, stats }) => {
              const single = stats.nPrograms === 1;
              return (
                <tr
                  key={school.slug}
                  className="border-b border-rule align-middle last:border-b-0"
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <SchoolLogo
                        logoUrl={school.logoUrl}
                        name={school.name}
                        shortName={school.shortName}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-ink">
                          {school.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-ink-3">
                          <span>{school.shortName}</span>
                          <SchoolTypeBadge category={school.category} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-ink">
                    {stats.nPrograms}
                  </td>
                  {single ? (
                    <td className="px-3 py-3 text-ink-3" colSpan={3}>
                      <span className="tabular-nums text-ink">
                        {formatMillions(stats.minAmount)}
                      </span>{" "}
                      · {stats.minMajorName}
                      <div className="text-sm text-ink-3">mới có 1 ngành</div>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-3">
                        <RangeCell
                          amount={stats.minAmount}
                          majorName={stats.minMajorName}
                        />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink">
                        {formatMillions(stats.medianAmount)}
                      </td>
                      <td className="px-3 py-3">
                        <RangeCell
                          amount={stats.maxAmount}
                          majorName={stats.maxMajorName}
                        />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3">
                    <span className="inline-block rounded-full bg-muted-bg px-2 py-0.5 text-xs font-medium text-muted-ink tabular-nums">
                      {stats.increaseSummary}
                    </span>
                  </td>
                  <td className="w-12 p-0 text-right">
                    <RowLink
                      href={`/truong/${school.slug}`}
                      label={school.shortName}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {rows.map(({ school, stats }) => {
          const single = stats.nPrograms === 1;
          return (
            <li
              key={school.slug}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-start gap-2.5">
                <SchoolLogo
                  logoUrl={school.logoUrl}
                  name={school.name}
                  shortName={school.shortName}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink">{school.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                    <span>{school.shortName}</span>
                    <SchoolTypeBadge category={school.category} />
                    <span>· {stats.nPrograms} ngành</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-lg font-semibold tabular-nums text-ink">
                {single
                  ? formatMillions(stats.minAmount)
                  : `${formatMillions(stats.minAmount)} – ${formatMillions(
                      stats.maxAmount,
                    )}`}
              </div>
              <div className="text-sm text-ink-3">
                {single
                  ? `mới có 1 ngành · ${stats.minMajorName}`
                  : `Trung vị ${formatMillions(stats.medianAmount)} · tăng ${
                      stats.increaseSummary
                    }`}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
