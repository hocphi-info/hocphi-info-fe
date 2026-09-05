import { formatMillions } from "@/lib/format";

// Server Component — the "khoảng Min–Max" range-bar chart (F11-c). Plain CSS
// (positioned divs), not Recharts — Recharts has no range-bar type (see the
// Week 3 plan). Generalized in Week 4 from the S2-only `SchoolRangeChart` so
// F7 (Min–Max per track within one school) can reuse the same rendering
// instead of a second chart implementation — see `SchoolRangeChart.tsx` for
// the S2 adapter and the school-detail page for the F7 usage.
//
// The x-axis auto-scales to the visible data. A row with a single program
// (min === max) shows one dot + a "mới có 1 ngành" note instead of a bar.

export interface RangeChartRow {
  key: string;
  label: string;
  nPrograms: number;
  minAmount: number;
  minLabel: string;
  medianAmount: number;
  maxAmount: number;
  maxLabel: string;
}

function niceCeil(n: number): number {
  if (n <= 0) return 10;
  const pow = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / pow) * pow;
}

export default function RangeChart({
  rows,
  title,
  subtitle,
  footnote,
  tableCaption,
}: {
  rows: RangeChartRow[];
  title: string;
  subtitle: string;
  /** Ghi chú cuối chart, cạnh chú thích màu (vd loại trừ hệ nào khỏi tính toán). */
  footnote?: string;
  /** `<caption>` của bảng dữ liệu sr-only (F11 — a11y). */
  tableCaption: string;
}) {
  if (rows.length === 0) return null;

  const maxAmount = Math.max(...rows.map((r) => r.maxAmount));
  const axisMax = niceCeil(maxAmount / 1_000_000); // in triệu
  const pct = (dong: number) => (dong / 1_000_000 / axisMax) * 100;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(axisMax * f));

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_oklch(0.28_0.03_260/0.06)]">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="text-xs text-ink-3">{subtitle}</span>
      </div>

      {/* axis */}
      <div
        className="mb-1 hidden text-[10.5px] text-ink-3 tabular-nums lg:grid"
        style={{ gridTemplateColumns: "186px 1fr 128px", gap: "14px" }}
        aria-hidden
      >
        <span />
        <div className="relative h-4">
          {ticks.map((t, i) => (
            <span
              key={t}
              className="absolute -translate-x-1/2"
              style={{
                left: `${(i / (ticks.length - 1)) * 100}%`,
                transform:
                  i === 0
                    ? "translateX(0)"
                    : i === ticks.length - 1
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <span />
      </div>

      <div className="flex flex-col gap-0.5">
        {rows.map((row) => {
          const single = row.nPrograms === 1;
          return (
            <div
              key={row.key}
              className="grid items-center gap-3.5 py-1.5 lg:gap-[14px]"
              style={{ gridTemplateColumns: "186px 1fr 128px" }}
            >
              <div className="min-w-0 text-[12.5px] font-medium leading-tight text-ink">
                <span className="line-clamp-1">{row.label}</span>
                <span className="text-[10.5px] font-normal text-ink-3">
                  {single ? "mới có 1 ngành" : `${row.nPrograms} ngành`}
                </span>
              </div>

              <div className="relative h-[22px]" aria-hidden>
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-rule" />
                {!single && (
                  <div
                    className="absolute top-[9px] h-1 rounded-full bg-ink-2"
                    style={{
                      left: `${pct(row.minAmount)}%`,
                      right: `${100 - pct(row.maxAmount)}%`,
                    }}
                  />
                )}
                {/* min dot */}
                <div
                  className="absolute top-[5px] size-3 -translate-x-1/2 rounded-full border-2 border-surface bg-ink-2"
                  style={{ left: `${pct(row.minAmount)}%` }}
                />
                {!single && (
                  <>
                    {/* max dot */}
                    <div
                      className="absolute top-[5px] size-3 -translate-x-1/2 rounded-full border-2 border-surface bg-accent"
                      style={{ left: `${pct(row.maxAmount)}%` }}
                    />
                    {/* median tick */}
                    <div
                      className="absolute top-[3px] h-4 w-0.5 bg-accent-strong"
                      style={{ left: `${pct(row.medianAmount)}%` }}
                    />
                  </>
                )}
              </div>

              <div className="text-right text-[12px] text-ink tabular-nums">
                {single ? (
                  <b>{formatMillions(row.minAmount)}</b>
                ) : (
                  <>
                    <b>{formatMillions(row.minAmount).replace(" tr", "")}</b>
                    <span className="text-ink-3"> – </span>
                    <b>{formatMillions(row.maxAmount).replace(" tr", "")}</b>
                    <span className="text-ink-3"> tr</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-dashed border-border pt-3 text-[11px] text-ink-3">
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-ink-2 align-middle" />
          Ngành rẻ nhất
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-0.5 bg-accent-strong align-middle" />
          Trung vị
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-accent align-middle" />
          Ngành đắt nhất
        </span>
        {footnote && <span>· {footnote}</span>}
      </div>

      {/* a11y: same data as a table for screen readers (F11). sr-only on a
          wrapping div, not the <table>: a clipped table still lays out at its
          intrinsic width and can push page scroll width. */}
      <div className="sr-only">
        <table>
          <caption>{tableCaption}</caption>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Số ngành</th>
              <th>Thấp nhất</th>
              <th>Trung vị</th>
              <th>Cao nhất</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{row.nPrograms}</td>
                <td>
                  {formatMillions(row.minAmount)} ({row.minLabel})
                </td>
                <td>{formatMillions(row.medianAmount)}</td>
                <td>
                  {formatMillions(row.maxAmount)} ({row.maxLabel})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
