import type { TuitionDisclosureLevel } from "@/types/domain";

// Server Component — pill nhỏ "Học phí minh bạch / không minh bạch" cạnh tên
// trường ở các bảng. Khác SchoolTypeBadge (pill nền đặc, chỉ phân loại): badge
// này CÓ hàm ý tốt/xấu nên dùng token good/bad riêng + viền + icon, để không
// nhầm với pill "Tư thục" màu xanh. Trường chưa đánh giá -> cha không render.
// Chi tiết (ghi chú, ngày kiểm tra, nguồn) nằm ở TuitionDisclosureBlock.

export const DISCLOSURE_LABELS: Record<TuitionDisclosureLevel, string> = {
  theo_nganh: "Học phí minh bạch",
  khong_minh_bach: "Học phí không minh bạch",
};

const TONE: Record<TuitionDisclosureLevel, string> = {
  theo_nganh: "border-good-ink/30 bg-good-bg text-good-ink",
  khong_minh_bach: "border-bad-ink/30 bg-bad-bg text-bad-ink",
};

export function DisclosureIcon({ level }: { level: TuitionDisclosureLevel }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {level === "theo_nganh" ? (
        <path d="M3.5 8.5l3 3 6-7" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M8 3.5v5.5" />
          <path d="M8 12.25v.25" />
        </>
      )}
    </svg>
  );
}

export default function TuitionDisclosureBadge({
  level,
}: {
  level: TuitionDisclosureLevel;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${TONE[level]}`}
    >
      <DisclosureIcon level={level} />
      {DISCLOSURE_LABELS[level]}
    </span>
  );
}
