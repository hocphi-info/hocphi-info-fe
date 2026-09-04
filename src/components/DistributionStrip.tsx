// Server Component — the S1 "dải phân bố" (mockup/Main.dc.html: distribution
// strip). Plain CSS: a horizontal rule, one dot per row positioned by `left: %`,
// a median tick, and outliers pulled out into pills below "hiển thị riêng, không
// tính vào trung vị". No chart library — the mockup itself is just positioned
// divs, and Recharts has no matching chart type (see the Week 3 plan).
//
// "Outlier" here = amount > OUTLIER_FACTOR × median of the non-outlier set, or a
// non-đại-trà track. Kept deliberately simple; tune the constant if the pilot
// data grows.

import type { MajorRow } from "@/types/domain";
import { formatMillions } from "@/lib/format";

const OUTLIER_FACTOR = 2;

function median(sortedAsc: number[]): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0
    ? (sortedAsc[mid - 1] + sortedAsc[mid]) / 2
    : sortedAsc[mid];
}

export default function DistributionStrip({ rows }: { rows: MajorRow[] }) {
  // Only đại trà feeds the median; other tracks are always shown separately.
  const daiTra = rows.filter((r) => r.program.track === "dai_tra");
  const others = rows.filter((r) => r.program.track !== "dai_tra");

  if (daiTra.length === 0 && others.length === 0) return null;

  const daiTraAmounts = daiTra
    .map((r) => r.year1.amountPerYear)
    .sort((a, b) => a - b);
  const roughMedian = median(daiTraAmounts);

  const mainRows = daiTra.filter(
    (r) => r.year1.amountPerYear <= roughMedian * OUTLIER_FACTOR,
  );
  const outliers = [
    ...daiTra.filter(
      (r) => r.year1.amountPerYear > roughMedian * OUTLIER_FACTOR,
    ),
    ...others,
  ];

  const mainAmounts = mainRows
    .map((r) => r.year1.amountPerYear)
    .sort((a, b) => a - b);
  const med = median(mainAmounts);
  const lo = mainAmounts[0] ?? 0;
  const hi = mainAmounts[mainAmounts.length - 1] ?? med;
  const span = hi - lo || 1;
  const pct = (v: number) => ((v - lo) / span) * 100;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">
          Phân bố học phí năm đầu — hệ đại trà
        </span>
        <span className="text-xs text-ink-3">
          {mainRows.length} chương trình · trung vị{" "}
          <b className="text-ink">{formatMillions(med)}</b>
        </span>
      </div>

      {mainRows.length > 0 && (
        <div className="relative mx-1.5 h-14" aria-hidden>
          <div className="absolute inset-x-0 top-8.5 h-0.5 bg-rule" />
          {/* median tick */}
          <div
            className="absolute top-1.5 bottom-2 w-0.5 bg-accent-strong"
            style={{ left: `${pct(med)}%` }}
          />
          <div
            className="absolute -top-1 -translate-x-1/2 text-[11px] font-bold text-accent-strong tabular-nums"
            style={{ left: `${pct(med)}%` }}
          >
            {formatMillions(med).replace(" tr", "")}
          </div>
          {mainRows.map((r) => (
            <div
              key={r.program.id}
              className="absolute top-7 size-3.5 -translate-x-1/2 rounded-full border-2 border-surface bg-ink-2"
              style={{ left: `${pct(r.year1.amountPerYear)}%` }}
              title={`${r.school.shortName} · ${formatMillions(r.year1.amountPerYear)}`}
            />
          ))}
          <div className="absolute top-11 left-0 text-[11px] text-ink-3 tabular-nums">
            {formatMillions(lo)}
          </div>
          <div className="absolute top-11 right-0 text-[11px] text-ink-3 tabular-nums">
            {formatMillions(hi)}
          </div>
        </div>
      )}

      {outliers.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3 text-[11.5px]">
          <span className="text-ink-3">
            Hiển thị riêng, không tính vào trung vị đại trà:
          </span>
          {outliers.map((r) => (
            <span
              key={r.program.id}
              className="rounded-full bg-accent-bg px-2 py-0.5 text-accent-ink"
            >
              {r.school.shortName} · {formatMillions(r.year1.amountPerYear)}
            </span>
          ))}
        </div>
      )}

      {/* a11y: the same data as a table for screen readers (F11). The sr-only
          class goes on a wrapping div, not the <table>: a clipped <table> still
          lays out at its intrinsic width and can push page scroll width. */}
      <div className="sr-only">
        <table>
          <caption>Phân bố học phí năm đầu hệ đại trà theo trường</caption>
          <thead>
            <tr>
              <th>Trường</th>
              <th>Ngành / Hệ</th>
              <th>Học phí năm đầu</th>
              <th>Tính vào trung vị</th>
            </tr>
          </thead>
          <tbody>
            {[...mainRows, ...outliers].map((r) => (
              <tr key={r.program.id}>
                <td>{r.school.name}</td>
                <td>{r.major.name}</td>
                <td>{formatMillions(r.year1.amountPerYear)}</td>
                <td>{mainRows.includes(r) ? "Có" : "Không"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
