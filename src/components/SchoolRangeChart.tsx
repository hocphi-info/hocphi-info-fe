import type { SchoolRow } from "@/types/domain";
import RangeChart from "@/components/RangeChart";

// Server Component — adapter cho S2: map SchoolRow[] (1 dòng / trường) sang
// RangeChartRow[] rồi vẽ bằng component chart dùng chung (Week 4 — trước đó
// file này TỰ vẽ chart, xem git history nếu cần đối chiếu). Hành vi/props bên
// ngoài không đổi so với trước.

export default function SchoolRangeChart({
  rows,
  basisAll,
}: {
  rows: SchoolRow[];
  /** true = range includes CLC/tiên tiến (spec S2 "cơ sở tính khoảng"). */
  basisAll: boolean;
}) {
  return (
    <RangeChart
      title="Khoảng học phí theo trường"
      subtitle={`triệu đồng / năm · ${
        basisAll ? "gồm cả CLC – tiên tiến" : "chỉ hệ đại trà"
      }`}
      footnote={
        !basisAll ? "Không tính hệ CLC / tiên tiến / quốc tế" : undefined
      }
      tableCaption="Khoảng học phí hệ đại trà theo trường"
      rows={rows.map(({ school, stats }) => ({
        key: school.slug,
        label: school.name,
        nPrograms: stats.nPrograms,
        minAmount: stats.minAmount,
        minLabel: stats.minMajorName,
        medianAmount: stats.medianAmount,
        maxAmount: stats.maxAmount,
        maxLabel: stats.maxMajorName,
      }))}
    />
  );
}
