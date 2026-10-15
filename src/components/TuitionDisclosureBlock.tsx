import Link from "next/link";
import { formatDateVi } from "@/lib/format";
import type { TuitionDisclosure } from "@/types/domain";
import {
  DISCLOSURE_LABELS,
  DisclosureIcon,
} from "@/components/TuitionDisclosureBadge";

// Server Component — khối giải thích mức công khai học phí ở trang chi tiết
// trường (F7) và ngành–trường (F6). Luôn kèm ngày kiểm tra + link bằng chứng:
// đây là nhận định của hocphi.info, người đọc phải tự đối chiếu được.

const DEFAULT_NOTE: Record<TuitionDisclosure["level"], string> = {
  theo_nganh:
    "Trường công bố học phí cụ thể cho từng ngành, xem được trước khi nộp hồ sơ.",
  khong_minh_bach:
    "Trường chưa công bố học phí cụ thể cho từng ngành trước khi tuyển sinh.",
};

const TONE: Record<TuitionDisclosure["level"], string> = {
  theo_nganh: "border-good-ink/25 bg-good-bg",
  khong_minh_bach: "border-bad-ink/25 bg-bad-bg",
};

const INK: Record<TuitionDisclosure["level"], string> = {
  theo_nganh: "text-good-ink",
  khong_minh_bach: "text-bad-ink",
};

export default function TuitionDisclosureBlock({
  disclosure,
}: {
  disclosure: TuitionDisclosure;
}) {
  const { level, note, checkedOn, evidenceUrl } = disclosure;

  return (
    <aside
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed text-ink-2 ${TONE[level]}`}
    >
      <p className={`flex items-center gap-1.5 font-semibold ${INK[level]}`}>
        <DisclosureIcon level={level} />
        {DISCLOSURE_LABELS[level]}
      </p>
      <p className="mt-1">{note ?? DEFAULT_NOTE[level]}</p>
      <p className="mt-2 text-xs text-ink-3">
        hocphi.info kiểm tra ngày {formatDateVi(checkedOn)} ·{" "}
        <a
          href={evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent"
        >
          Xem trang của trường
        </a>{" "}
        ·{" "}
        <Link
          href="/phuong-phap#minh-bach"
          className="underline hover:text-accent"
        >
          Tiêu chí đánh giá
        </Link>
      </p>
    </aside>
  );
}
