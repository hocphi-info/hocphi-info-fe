import Link from "next/link";
import type { MajorRow } from "@/types/domain";
import { totalCourseCost } from "@/lib/derive";
import { formatMillions } from "@/lib/format";
import SchoolTypeBadge from "@/components/SchoolTypeBadge";
import IncreaseBadge from "@/components/IncreaseBadge";
import CompareCheckbox from "@/components/CompareCheckbox";

// Server Component — renders the S1 result list. Desktop: a table. Mobile
// (<lg): a stack of cards. Columns follow ../yeu-cau-san-pham.md §6/S1.
// The chevron links to "#" for now; Week 4 points it at the detail route.

const TRACK_LABELS: Record<MajorRow["program"]["track"], string> = {
  dai_tra: "Đại trà",
  chat_luong_cao: "Chất lượng cao",
  tien_tien: "Tiên tiến",
  quoc_te: "Quốc tế / liên kết",
};

function totalFor(row: MajorRow): string {
  const pct = row.increase?.annualIncreasePct;
  return formatMillions(totalCourseCost(row.year1.amountPerYear, pct), {
    approx: true,
  });
}

export default function MajorResultsTable({ rows }: { rows: MajorRow[] }) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse text-sm lg:table">
        <thead>
          <tr className="border-b border-border text-left text-ink-3">
            <th className="w-8 py-2" />
            <th className="py-2 font-medium">Trường</th>
            <th className="py-2 font-medium">Ngành / Hệ</th>
            <th className="w-28 py-2 text-right font-medium">Năm đầu</th>
            <th className="w-32 py-2 text-right font-medium">
              Tổng (ước lượng)
            </th>
            <th className="w-32 py-2 pl-4 font-medium">% Tăng/năm</th>
            <th className="w-8 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.program.id} className="border-b border-rule align-top">
              <td className="py-3">
                <CompareCheckbox
                  id={row.program.id}
                  label={`${row.major.name} — ${row.school.shortName}`}
                />
              </td>
              <td className="py-3">
                <div className="font-medium text-ink">{row.school.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-ink-3">
                  <span>{row.school.shortName}</span>
                  <SchoolTypeBadge category={row.school.category} />
                </div>
              </td>
              <td className="py-3">
                <div className="text-ink">{row.major.name}</div>
                <div className="text-ink-3">
                  {TRACK_LABELS[row.program.track]}
                </div>
              </td>
              <td className="py-3 text-right tabular-nums text-ink">
                {formatMillions(row.year1.amountPerYear)}
              </td>
              <td className="py-3 text-right tabular-nums text-ink">
                {totalFor(row)}
              </td>
              <td className="py-3 pl-4">
                <IncreaseBadge
                  pct={row.increase?.annualIncreasePct ?? null}
                  source={row.increase?.increaseSource ?? null}
                />
              </td>
              <td className="py-3 text-right">
                <Link
                  href="#"
                  aria-label={`Xem chi tiết ${row.major.name} — ${row.school.shortName}`}
                  className="text-ink-3 hover:text-accent"
                >
                  ›
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{row.school.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                  <span>{row.school.shortName}</span>
                  <SchoolTypeBadge category={row.school.category} />
                </div>
                <div className="mt-1 text-sm text-ink-2">
                  {row.major.name} · {TRACK_LABELS[row.program.track]}
                </div>
                <div className="mt-2 flex items-end gap-6">
                  <div>
                    <div className="text-xs text-ink-3">Năm đầu</div>
                    <div className="tabular-nums text-ink">
                      {formatMillions(row.year1.amountPerYear)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-3">Tổng 4 năm</div>
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
