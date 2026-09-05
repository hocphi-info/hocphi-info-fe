"use client"; // Recharts renders via hooks/DOM measurement — Client Component

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearlyAmount } from "@/types/domain";
import { formatMillions } from "@/lib/format";

// Màu 1 cột/mục so sánh (tối đa 3) — tái dùng token màu đã có (accent + 2 tag
// color) thay vì thêm biến CSS mới chỉ cho chart này.
const CHART_COLORS = [
  "var(--color-accent)",
  "var(--color-tag-green-ink)",
  "var(--color-tag-amber-ink)",
];

export interface CompareChartItem {
  id: string;
  label: string;
  yearlyAmounts: YearlyAmount[];
}

// Biểu đồ cột nhóm theo năm học (F11-d) cho trang so sánh (F8, Tuần 5) — mỗi
// nhóm = 1 "Năm học THỨ MẤY" (Năm 1, Năm 2...), mỗi cột trong nhóm = 1 mục.
// Nhóm theo THỨ TỰ, không theo academicYear thật: các mục so sánh có thể khác
// trường/khác khoá nhập học nên nhãn năm tuyệt đối không chắc khớp nhau, còn
// "năm thứ mấy của chương trình" thì luôn so sánh được. Kèm bảng dữ liệu
// sr-only (F11 — a11y), cùng pattern với TuitionTrendChart/RangeChart.
export default function CompareTrendChart({
  items,
}: {
  items: CompareChartItem[];
}) {
  const maxYears = Math.max(0, ...items.map((i) => i.yearlyAmounts.length));
  const data = Array.from({ length: maxYears }, (_, i) => {
    const row: Record<string, number | string> = { yearLabel: `Năm ${i + 1}` };
    items.forEach((item) => {
      const y = item.yearlyAmounts[i];
      if (y) row[item.id] = Math.round(y.amountPerYear / 1_000_000);
    });
    return row;
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)]">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">
          Học phí theo năm — so sánh
        </span>
        <span className="text-xs text-ink-3">triệu đồng / năm</span>
      </div>

      <div className="h-56" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="yearLabel"
              tick={{ fontSize: 11, fill: "var(--color-ink-3)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-ink-3)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value, name) => [`${value} tr`, name]}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            {items.map((item, i) => (
              <Bar
                key={item.id}
                dataKey={item.id}
                name={item.label}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-dashed border-border pt-3 text-[11px] text-ink-3">
        {items.map((item, i) => (
          <span key={item.id}>
            <span
              className="mr-1 inline-block size-2 rounded-full align-middle"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* a11y: bảng dữ liệu tương đương cho screen reader (F11). */}
      <div className="sr-only">
        <table>
          <caption>Học phí theo năm học — so sánh {items.length} mục</caption>
          <thead>
            <tr>
              <th>Năm học</th>
              {items.map((item) => (
                <th key={item.id}>{item.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.yearLabel as string}>
                <td>{row.yearLabel}</td>
                {items.map((item) => (
                  <td key={item.id}>
                    {row[item.id] != null
                      ? formatMillions((row[item.id] as number) * 1_000_000)
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
