import { SOCIAL_LINKS } from "@/lib/site";

// Server Component — nút theo dõi Facebook/Threads (+ RSS tuỳ chọn). Lấy URL từ
// SOCIAL_LINKS để không lặp địa chỉ ở nhiều nơi.
const BTN =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-accent-border hover:bg-surface-2";
const BTN_PRIMARY =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-accent bg-accent px-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90";

function href(label: string): string {
  return SOCIAL_LINKS.find((s) => s.label === label)?.href ?? "#";
}

export default function FollowLinks({
  label = "Theo dõi",
  primary = false,
  rss = false,
}: {
  /** Tiền tố trên nút, ví dụ "Theo dõi" → "Theo dõi Facebook". Chuỗi rỗng → chỉ tên nền tảng. */
  label?: string;
  primary?: boolean;
  rss?: boolean;
}) {
  const prefix = label ? `${label} ` : "";
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={href("Facebook")}
        target="_blank"
        rel="me noopener noreferrer"
        data-umami-event="follow-facebook"
        className={primary ? BTN_PRIMARY : BTN}
      >
        {prefix}Facebook
      </a>
      <a
        href={href("Threads")}
        target="_blank"
        rel="me noopener noreferrer"
        data-umami-event="follow-threads"
        className={BTN}
      >
        {prefix}Threads
      </a>
      {rss ? (
        <a href="/bai-viet/feed.xml" className={BTN}>
          RSS
        </a>
      ) : null}
    </div>
  );
}
