import type { Track } from "@/types/domain";

// Number formatting helpers, following the display rules in
// ../yeu-cau-san-pham.md §2.1:
//   - money is shown in "triệu đồng" (millions), decimal comma, thousands dot (VN style)
//   - estimated numbers get a "≈" prefix
//   - percentage increase reads "+8%/năm"

/** Nhãn tiếng Việt cho hệ đào tạo — dùng chung ở bảng S1 và trang chi tiết trường (F7). */
export const TRACK_LABELS: Record<Track, string> = {
  dai_tra: "Đại trà",
  chat_luong_cao: "Chất lượng cao",
  tien_tien: "Tiên tiến",
  quoc_te: "Quốc tế / liên kết",
};

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

/** Nhãn cơ sở đào tạo cho `program.campus` (BE: `null` = cơ sở chính).
 * "Khánh Hòa" -> "Phân hiệu Khánh Hòa"; `null` -> "Cơ sở chính". */
export function campusLabel(campus: string | null): string {
  return campus ? `Phân hiệu ${campus}` : "Cơ sở chính";
}
