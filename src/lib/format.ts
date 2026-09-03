// Number formatting helpers, following the display rules in
// ../yeu-cau-san-pham.md §2.1:
//   - money is shown in "triệu đồng" (millions), decimal comma, thousands dot (VN style)
//   - estimated numbers get a "≈" prefix
//   - percentage increase reads "+8%/năm"

/**
 * 33_000_000  -> "33,0 tr"
 * 1_398_000_000 -> "1.398 tr"   (with opts.approx -> "≈ 1.398 tr")
 */
export function formatMillions(
  dong: number,
  opts: { approx?: boolean } = {},
): string {
  const millions = dong / 1_000_000;
  // 1 chữ số thập phân khi < 100 triệu, làm tròn nguyên khi lớn hơn (đỡ rối mắt).
  const text =
    millions < 100
      ? millions.toLocaleString("vi-VN", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : Math.round(millions).toLocaleString("vi-VN");
  return `${opts.approx ? "≈ " : ""}${text} tr`;
}

/** 8 -> "+8%/năm" */
export function formatPercent(pct: number): string {
  return `+${pct}%/năm`;
}
