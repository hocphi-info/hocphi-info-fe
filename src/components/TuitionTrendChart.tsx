"use client"; // Recharts renders via hooks/DOM measurement — Client Component

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearlyAmount } from "@/types/domain";
import { formatMillions } from "@/lib/format";

// Xu hướng học phí theo năm (F6/F11-b) — 1 cột / năm, màu khác nhau cho công
// bố (Năm 1) vs dự phóng (Năm 2..N) chứ không phải 2 series chồng nhau. Kèm
// bảng dữ liệu sr-only (F11 — a11y), cùng pattern với RangeChart.tsx.
export default function TuitionTrendChart({
  yearlyAmounts,
}: {
  yearlyAmounts: YearlyAmount[];
}) {
  const data = yearlyAmounts.map((y) => ({
    ...y,
    trieu: Math.round(y.amountPerYear / 1_000_000),
  }));

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)]">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">Học phí theo năm</span>
        <span className="text-xs text-ink-3">triệu đồng / năm</span>
      </div>

      <div className="h-56" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="academicYear"
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
              formatter={(value) => [`${value} tr`, "Học phí/năm"]}
              labelFormatter={(label) => `Năm học ${label}`}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="trieu" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.academicYear}
                  fill={
                    d.isProjected ? "var(--color-ink-2)" : "var(--color-accent)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-dashed border-border pt-3 text-[11px] text-ink-3">
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-accent align-middle" />
          Công bố (Năm 1)
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-ink-2 align-middle" />
          Dự phóng
        </span>
      </div>

      {yearlyAmounts.length === 1 && (
        <p className="mt-2 text-xs text-ink-3">
          Chương trình 1 năm — chỉ có 1 mức học phí công bố.
        </p>
      )}

      {/* a11y: bảng dữ liệu tương đương cho screen reader (F11). */}
      <div className="sr-only">
        <table>
          <caption>Học phí theo năm học</caption>
          <thead>
            <tr>
              <th>Năm học</th>
              <th>Học phí/năm</th>
              <th>Loại số liệu</th>
            </tr>
          </thead>
          <tbody>
            {yearlyAmounts.map((y) => (
              <tr key={y.academicYear}>
                <td>{y.academicYear}</td>
                <td>{formatMillions(y.amountPerYear)}</td>
                <td>{y.isProjected ? "Dự phóng" : "Công bố"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
