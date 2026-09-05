import type { MajorRow } from "@/types/domain";
import type { MajorFilters } from "@/lib/filters";
import { totalCourseCost } from "@/lib/derive";
import { formatMillions, TRACK_LABELS } from "@/lib/format";
import SchoolTypeBadge from "@/components/SchoolTypeBadge";
import SchoolLogo from "@/components/SchoolLogo";
import IncreaseBadge from "@/components/IncreaseBadge";
import CompareCheckbox from "@/components/CompareCheckbox";
import SortableHeader from "@/components/SortableHeader";
import RowLink from "@/components/RowLink";

// Server Component — renders the S1 result list. Desktop: a table wrapped in a
// card so it reads as a table; the sortable column headers (SortableHeader) are
// Client leaves. Mobile (<lg): a stack of cards, unchanged. Columns follow
// ../yeu-cau-san-pham.md §6/S1.
//
// Row click: only the chevron (RowLink) in the last cell is the click target —
// the row itself is not clickable, so its text stays selectable/copyable. The
// detail route (S3/S4) is Week 4 — until then RowLink points at "#" with
// scroll={false}. Week 4: swap RowLink's href for the real path.

// The key that is NOT written to the URL (the default sort), passed to each
// SortableHeader so it knows when to omit `sort` from the query string.
const SORT_DEFAULT = "year1" as const;

function totalFor(row: MajorRow): string {
  const pct = row.increase?.annualIncreasePct;
  const years = row.major.standardYears ?? 4;
  return formatMillions(totalCourseCost(row.year1.amountPerYear, pct, years), {
    approx: true,
  });
}

/** aria-sort value for a column header given the active sort + direction. */
function ariaSort(
  isActive: boolean,
  dir: MajorFilters["dir"],
): "ascending" | "descending" | "none" {
  if (!isActive) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

export default function MajorResultsTable({
  rows,
  sort,
  dir,
}: {
  rows: MajorRow[];
  sort: MajorFilters["sort"];
  dir: MajorFilters["dir"];
}) {
  return (
    <>
      {/* Desktop table — wrapped in a card (border + surface + rounded) so it
          reads as a table. `overflow-hidden` clips the square border-collapse
          corners to the rounded wrapper. */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)] lg:block">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-ink-3">
              <th scope="col" className="w-8 py-2 pl-4" />
              <th
                scope="col"
                aria-sort={ariaSort(sort === "name", dir)}
                className="px-3 py-2 font-medium"
              >
                <SortableHeader
                  sortKey="name"
                  label="Trường"
                  active={sort === "name"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                />
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Ngành / Hệ
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "year1", dir)}
                className="w-28 px-3 py-2 text-center font-medium"
              >
                <SortableHeader
                  sortKey="year1"
                  label="Năm đầu"
                  active={sort === "year1"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                  align="center"
                />
              </th>
              <th
                scope="col"
                className="w-20 px-3 py-2 text-center font-medium"
              >
                Số năm
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "total", dir)}
                className="w-36 px-3 py-2 text-center font-medium"
              >
                <SortableHeader
                  sortKey="total"
                  label="Tổng (ước lượng)"
                  active={sort === "total"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                  align="center"
                />
              </th>
              <th
                scope="col"
                aria-sort={ariaSort(sort === "increase", dir)}
                className="w-32 px-3 py-2 text-center font-medium"
              >
                <SortableHeader
                  sortKey="increase"
                  label="% tăng/năm"
                  active={sort === "increase"}
                  dir={dir}
                  defaultKey={SORT_DEFAULT}
                  align="center"
                />
              </th>
              <th scope="col" className="w-12 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.program.id}
                className="border-b border-rule align-middle last:border-b-0"
              >
                <td className="py-3 pl-4">
                  <CompareCheckbox
                    id={row.program.id}
                    label={`${row.major.name} — ${row.school.shortName}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <SchoolLogo
                      logoUrl={row.school.logoUrl}
                      name={row.school.name}
                      shortName={row.school.shortName}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-ink">
                        {row.school.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-ink-3">
                        <span>{row.school.shortName}</span>
                        <SchoolTypeBadge category={row.school.category} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-ink">{row.major.name}</div>
                  <div className="text-ink-3">
                    {TRACK_LABELS[row.program.track]}
                  </div>
                </td>
                <td className="px-3 py-3 text-center tabular-nums text-ink">
                  {formatMillions(row.year1.amountPerYear)}
                </td>
                <td className="px-3 py-3 text-center tabular-nums text-ink">
                  {row.major.standardYears}
                </td>
                <td className="px-3 py-3 text-center tabular-nums text-ink">
                  {totalFor(row)}
                </td>
                <td className="px-3 py-3 text-center">
                  <IncreaseBadge
                    pct={row.increase?.annualIncreasePct ?? null}
                    source={row.increase?.increaseSource ?? null}
                  />
                </td>
                <td className="w-12 p-0 text-right">
                  <RowLink
                    href={`/nganh/${row.school.slug}/${row.major.slug}`}
                    label={`${row.major.name} — ${row.school.shortName}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.program.id}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-start gap-2">
              <CompareCheckbox
                id={row.program.id}
                label={`${row.major.name} — ${row.school.shortName}`}
              />
              <SchoolLogo
                logoUrl={row.school.logoUrl}
                name={row.school.name}
                shortName={row.school.shortName}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{row.school.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                  <span>{row.school.shortName}</span>
                  <SchoolTypeBadge category={row.school.category} />
                </div>
                <div className="mt-1 text-base text-ink-2">
                  {row.major.name} · {TRACK_LABELS[row.program.track]}
                </div>
                <div className="mt-2 flex items-end gap-6">
                  <div>
                    <div className="text-sm text-ink-3">Năm đầu</div>
                    <div className="tabular-nums text-ink">
                      {formatMillions(row.year1.amountPerYear)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-3">
                      Tổng {row.major.standardYears} năm
                    </div>
                    <div className="tabular-nums text-ink">{totalFor(row)}</div>
                  </div>
                  <div className="ml-auto">
                    <IncreaseBadge
                      pct={row.increase?.annualIncreasePct ?? null}
                      source={row.increase?.increaseSource ?? null}
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
