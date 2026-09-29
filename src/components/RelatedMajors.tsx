import Link from "next/link";
import type { Major, RelatedMajor } from "@/types/domain";
import { formatMillions } from "@/lib/format";

// "Ngành cùng nhóm" ở trang chi tiết ngành-trường (F6): các ngành CÙNG NHÓM NGÀNH
// (danh mục Bộ GD&ĐT) đang có dữ liệu, kèm số trường + khoảng học phí năm 1 hệ đại
// trà — để người xem so sánh nhanh với ngành gần nghĩa. Danh sách do BE suy ra từ
// cây phân loại (`relatedMajors`), FE chỉ hiển thị. Rỗng thì không render gì (ngành
// "Chưa phân loại" hoặc nhóm chỉ có 1 ngành).
//
// Mỗi mục dẫn sang `/nganh?major=<slug>` — khoá `major` đã có sẵn ở bảng tra cứu.
export default function RelatedMajors({
  major,
  related,
}: {
  major: Major;
  related: RelatedMajor[];
}) {
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-majors-title" className="space-y-3">
      <div>
        <h2
          id="related-majors-title"
          className="text-lg font-semibold text-ink"
        >
          Ngành cùng nhóm
        </h2>
        {major.taxonomy && (
          <p className="mt-0.5 text-sm text-ink-3">
            Nhóm ngành “{major.taxonomy.group.name}” ·{" "}
            {major.taxonomy.field.name}
          </p>
        )}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/nganh?major=${r.slug}`}
              className="block rounded-lg border border-border bg-surface px-3 py-2 hover:border-accent"
            >
              <span className="font-medium text-ink">{r.name}</span>
              <span className="mt-0.5 block text-sm text-ink-3 tabular-nums">
                {r.nSchools} trường · {amountRange(r)} / năm (hệ đại trà)
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function amountRange(r: RelatedMajor): string {
  return r.minYear1Amount === r.maxYear1Amount
    ? formatMillions(r.minYear1Amount)
    : `${formatMillions(r.minYear1Amount)} – ${formatMillions(r.maxYear1Amount)}`;
}
