import Link from "next/link";
import { compareParamsFrom } from "@/lib/compare";

// Dùng chung cho 2 tình huống của trang so sánh (F8, Tuần 5): vào thẳng
// `/so-sanh` bằng URL chỉ có 0/1 mục hợp lệ, HOẶC xoá bớt (client-side) xuống
// còn 1 mục — không tự động điều hướng, chỉ mời quay lại /nganh. Khi còn
// đúng 1 mục, link quay lại mang theo `item=<id>` đó để không mất lựa chọn.
export default function CompareEmptyState({
  remaining,
}: {
  remaining?: { id: string; label: string };
}) {
  const href = remaining
    ? `/nganh?${compareParamsFrom([remaining.id])}`
    : "/nganh";

  return (
    <div className="mx-auto mt-6 max-w-lg rounded-xl border border-border bg-surface p-6 text-center">
      <p className="text-ink">
        {remaining
          ? `Cần thêm ít nhất 1 mục nữa để so sánh cùng "${remaining.label}".`
          : "Chưa có mục nào để so sánh."}
      </p>
      <p className="mt-1 text-sm text-ink-3">
        Chọn 2–3 mục ngành–trường ở trang tra cứu rồi bấm nút So sánh.
      </p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-lg border border-border px-4 py-2 text-sm text-ink hover:bg-surface-2"
      >
        Về trang tra cứu theo ngành
      </Link>
    </div>
  );
}
