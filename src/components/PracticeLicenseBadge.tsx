// Server Component — pill dưới H1 trang chi tiết ngành-trường (F6/F10): ngành này
// dẫn tới một nghề cần cấp phép sau tốt nghiệp (luật sư, bác sĩ…). Câu chữ có
// điều kiện "Muốn hành nghề…" vì bằng đại học vẫn dùng được cho việc khác của
// ngành (vd pháp chế doanh nghiệp). Bấm để nhảy xuống khối chi tiết bên dưới.
// Tone cảnh báo (warn) như Callout — khác TuitionDisclosureBadge (good/bad).

export default function PracticeLicenseBadge({
  profession,
}: {
  profession: string;
}) {
  return (
    <a
      href="#chi-phi-hanh-nghe"
      className="inline-flex items-center gap-1 rounded-full border border-warn-ink/30 bg-warn-bg px-2.5 py-0.5 text-xs font-medium text-warn-ink hover:underline"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 2.5l6 11H2z" />
        <path d="M8 7v3" />
        <path d="M8 12v.25" />
      </svg>
      Muốn hành nghề {profession} cần cấp phép sau tốt nghiệp
    </a>
  );
}
