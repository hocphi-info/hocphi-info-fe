import type { IncreaseSource } from "@/types/domain";

// Server Component — the "Tăng/năm" badge.
//   published_roadmap -> "+8%"          on accent background
//   default_estimate  -> "+10% ước lượng" on muted background
//   no data (pct null) -> "—" with a tooltip

export default function IncreaseBadge({
  pct,
  source,
}: {
  pct: number | null;
  source: IncreaseSource | null;
}) {
  if (pct == null || source == null) {
    return (
      <span
        className="text-ink-3"
        title="Trường chưa công bố lộ trình tăng học phí"
      >
        —
      </span>
    );
  }

  const published = source === "published_roadmap";
  const tone = published
    ? "bg-accent-bg text-accent-ink"
    : "bg-muted-bg text-muted-ink";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${tone}`}
    >
      +{pct}%{published ? "" : " ước lượng"}
    </span>
  );
}
