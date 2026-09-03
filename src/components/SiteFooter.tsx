import Link from "next/link";

// Server Component — static notes required at the bottom of S1/S2
// (../yeu-cau-san-pham.md §6 footer).
export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-2">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-sm text-ink-2">
        <p>
          Số liệu học phí là <strong>dữ liệu mẫu minh hoạ</strong>, chưa kiểm
          chứng. Mọi mức học phí quy về đồng/năm; số tổng cả khoá là ước lượng
          theo % tăng.
        </p>
        <p>Cập nhật: 09/2026 · Pilot 50 trường TP.HCM &amp; Hà Nội.</p>
        <p>
          <Link href="/" className="text-accent-ink underline">
            Về trang chủ
          </Link>
        </p>
      </div>
    </footer>
  );
}
