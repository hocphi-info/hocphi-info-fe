import type { SchoolCategory } from "@/types/domain";

// Server Component — maps a school `category` enum value to its Vietnamese label
// and pill colour. Each of the four categories gets its own hue so the result
// list can be scanned at a glance; colour is classification only, not good/bad,
// and the text label is always shown (see mockup/Main.dc.html).

const LABELS: Record<SchoolCategory, string> = {
  cong_lap: "Công lập",
  cong_lap_tu_chu: "Công lập tự chủ",
  tu_thuc: "Tư thục",
  tu_thuc_von_nuoc_ngoai: "Tư thục · 100% vốn nước ngoài",
};

const TONE: Record<SchoolCategory, string> = {
  cong_lap: "bg-tag-red-bg text-tag-red-ink",
  cong_lap_tu_chu: "bg-tag-amber-bg text-tag-amber-ink",
  tu_thuc: "bg-tag-green-bg text-tag-green-ink",
  tu_thuc_von_nuoc_ngoai: "bg-tag-blue-bg text-tag-blue-ink",
};

export default function SchoolTypeBadge({
  category,
}: {
  category: SchoolCategory;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TONE[category]}`}
    >
      {LABELS[category]}
    </span>
  );
}
