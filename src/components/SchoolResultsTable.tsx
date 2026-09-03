import Link from "next/link";
import type { SchoolRow } from "@/types/domain";
import { formatMillions } from "@/lib/format";
import SchoolTypeBadge from "@/components/SchoolTypeBadge";

// Server Component — S2 result list. Each row is one school with its đại-trà
// tuition range (min / median / max). Columns follow ../yeu-cau-san-pham.md §6/S2.
// A school with a single major shows one number + a "mới có 1 ngành" note.

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
      <div className="text-xs text-ink-3">{majorName}</div>
    </div>
  );
}

export default function SchoolResultsTable({ rows }: { rows: SchoolRow[] }) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse text-sm lg:table">
        <thead>
          <tr className="border-b border-border text-left text-ink-3">
            <th className="py-2 pr-3 font-medium">Trường</th>
            <th className="w-16 px-3 py-2 text-right font-medium">Số ngành</th>
            <th className="w-40 px-3 py-2 font-medium">Thấp nhất</th>
            <th className="w-24 px-3 py-2 text-right font-medium">Trung vị</th>
            <th className="w-40 px-3 py-2 font-medium">Cao nhất</th>
            <th className="w-24 px-3 py-2 font-medium">Tăng/năm</th>
            <th className="w-8 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ school, stats }) => {
            const single = stats.nPrograms === 1;
            return (
              <tr key={school.slug} className="border-b border-rule align-top">
                <td className="py-3 pr-3">
                  <div className="font-medium text-ink">{school.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-ink-3">
                    <span>{school.shortName}</span>
                    <SchoolTypeBadge category={school.category} />
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
                    <div className="text-xs text-ink-3">mới có 1 ngành</div>
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
                <td className="py-3 text-right">
                  <Link
                    href="#"
                    aria-label={`Xem chi tiết ${school.shortName}`}
                    className="text-ink-3 hover:text-accent"
                  >
                    ›
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {rows.map(({ school, stats }) => {
          const single = stats.nPrograms === 1;
          return (
            <li
              key={school.slug}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="font-medium text-ink">{school.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                <span>{school.shortName}</span>
                <SchoolTypeBadge category={school.category} />
                <span>· {stats.nPrograms} ngành</span>
              </div>
              <div className="mt-2 text-lg font-semibold tabular-nums text-ink">
                {single
                  ? formatMillions(stats.minAmount)
                  : `${formatMillions(stats.minAmount)} – ${formatMillions(
                      stats.maxAmount,
                    )}`}
              </div>
              <div className="text-xs text-ink-3">
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
