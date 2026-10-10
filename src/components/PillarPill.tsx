import { type PillarKey, pillarLabel } from "@/lib/posts";

// Server Component — nhãn nhóm nội dung. Màu theo token (có bản tối), và nhãn chữ
// luôn hiện nên màu không phải kênh thông tin duy nhất (cùng nguyên tắc tag loại trường).
const TONE: Record<PillarKey, string> = {
  data: "bg-tag-blue-bg text-tag-blue-ink",
  research: "bg-tag-teal-bg text-tag-teal-ink",
  news: "bg-tag-amber-bg text-tag-amber-ink",
};

export default function PillarPill({ pillar }: { pillar: PillarKey }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE[pillar]}`}
    >
      {pillarLabel(pillar)}
    </span>
  );
}
