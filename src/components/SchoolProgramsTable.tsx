import type { SchoolProgramRow } from "@/types/domain";
import { campusLabel, formatMillions, TRACK_LABELS } from "@/lib/format";
import RowLink from "@/components/RowLink";

// Bảng danh sách ngành của 1 trường (F7) — không sort/lọc/so sánh (khác
// MajorResultsTable/SchoolResultsTable ở S1/S2), chỉ liệt kê + dẫn sang trang
// chi tiết ngành-trường (F6) qua RowLink. Cùng khuôn desktop-table +
// mobile-card như 2 bảng kia.
export default function SchoolProgramsTable({
  schoolSlug,
  rows,
}: {
  schoolSlug: string;
  rows: SchoolProgramRow[];
}) {
  // Chỉ hiện cột "Cơ sở" khi trường này thực sự có chương trình ở phân hiệu —
  // các trường 1 cơ sở giữ nguyên bảng cũ, không mọc thêm cột trống.
  const showCampus = rows.some((r) => r.program.campus !== null);

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)] lg:block">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-ink-3">
              <th scope="col" className="px-4 py-2 font-medium">
                Ngành
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Hệ
              </th>
              {showCampus && (
                <th scope="col" className="px-3 py-2 font-medium">
                  Cơ sở
                </th>
              )}
              <th
                scope="col"
                className="w-28 px-3 py-2 text-center font-medium"
              >
                Năm đầu
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
                <td className="px-4 py-3 text-ink">
                  {row.program.displayName ?? row.major.name}
                </td>
                <td className="px-3 py-3 text-ink-3">
                  {TRACK_LABELS[row.program.track]}
                </td>
                {showCampus && (
                  <td className="px-3 py-3 text-ink-3">
                    {campusLabel(row.program.campus)}
                  </td>
                )}
                <td className="px-3 py-3 text-center tabular-nums text-ink">
                  {formatMillions(row.year1.amountPerYear)}
                </td>
                <td className="w-12 p-0 text-right">
                  <RowLink
                    href={`/nganh/${schoolSlug}/${row.major.slug}`}
                    label={row.major.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.program.id}
            className="rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-ink">
                  {row.program.displayName ?? row.major.name}
                </div>
                <div className="text-sm text-ink-3">
                  {TRACK_LABELS[row.program.track]}
                  {showCampus && ` · ${campusLabel(row.program.campus)}`}
                </div>
              </div>
              <div className="text-right tabular-nums text-ink">
                {formatMillions(row.year1.amountPerYear)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
