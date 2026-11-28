import type { SourceDocType, Track } from "@/types/domain";

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

/** Nhãn tiếng Việt cho loại tài liệu nguồn — dùng ở khối "Nguồn dữ liệu" và câu dẫn SEO. */
export const DOC_TYPE_LABELS: Record<SourceDocType, string> = {
  de_an_tuyen_sinh: "Đề án tuyển sinh",
  thong_bao_hoc_phi: "Thông báo học phí",
  quy_dinh_nghe: "Quy định nghề",
  khac: "Khác",
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

/** Số triệu theo đúng độ chính xác `formatMillions` chọn cho `ref` (không kèm "tr"). */
function millionsText(dong: number, ref: number): string {
  if (dong === 0) return "0"; // "0–48,0 tr" dễ đọc hơn "0,0–48,0 tr"
  const millions = dong / 1_000_000;
  return ref / 1_000_000 < 100
    ? millions.toLocaleString("vi-VN", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : Math.round(millions).toLocaleString("vi-VN");
}

/**
 * Khoảng tiền (F10 — chi phí hành nghề):
 * (37_480_000, 71_900_000) -> "37,5–71,9 tr"; min = max -> "3,0 tr";
 * (0, 48_000_000) -> "0–48,0 tr"; (0, 0) -> "Miễn phí".
 * Hai đầu dùng chung độ chính xác của số lớn hơn để không ra "95,0–120 tr".
 */
export function formatMillionsRange(min: number, max: number): string {
  if (max === 0) return "Miễn phí";
  if (min === max) return formatMillions(min);
  return `${millionsText(min, max)}–${millionsText(max, max)} tr`;
}

/** Số tháng -> số năm làm tròn 0,5: 24 -> "2 năm", 30 -> "2,5 năm", 6 -> "0,5 năm". */
export function formatYearsFromMonths(months: number): string {
  const years = Math.round(months / 6) / 2;
  return `${years.toLocaleString("vi-VN")} năm`;
}

/** "2026-10-16" (date ISO từ API) -> "16/10/2026". Cắt chuỗi thay vì `new Date()`
 * để không lệch ngày theo múi giờ của server/trình duyệt. */
export function formatDateVi(isoDate: string): string {
  // Cũng nhận datetime ISO ("2026-11-27T12:00:00Z" — `sources.checkedAt`): BE
  // ghi giờ trưa UTC nên phần ngày đúng ở cả giờ VN lẫn UTC.
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
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
