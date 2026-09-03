import type { SchoolCategory } from "@/types/domain";

// Server Component — maps a school `category` enum value to its Vietnamese label
// and pill colour. Accent pill for private schools, muted pill for public ones
// (mirrors mockup/Main.dc.html).

const LABELS: Record<SchoolCategory, string> = {
  cong_lap: "Công lập",
  cong_lap_tu_chu: "Công lập tự chủ",
  tu_thuc: "Tư thục",
  tu_thuc_von_nuoc_ngoai: "Tư thục · 100% vốn nước ngoài",
};

const PRIVATE: SchoolCategory[] = ["tu_thuc", "tu_thuc_von_nuoc_ngoai"];

export default function SchoolTypeBadge({
  category,
}: {
  category: SchoolCategory;
}) {
  const tone = PRIVATE.includes(category)
    ? "bg-accent-bg text-accent-ink"
    : "bg-muted-bg text-muted-ink";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {LABELS[category]}
    </span>
  );
}
