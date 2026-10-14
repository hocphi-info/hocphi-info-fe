import pillars from "@/lib/pillars.json";
import type { Post } from "@/lib/posts";

// Server Component — ảnh bìa của bài trong danh sách.
//  - Bài có `cover` tự làm: hiện ảnh đó.
//  - Không có: thẻ CSS theo nhóm (logo + nhãn nhóm + vòng tròn trang trí). KHÔNG hiện
//    tiêu đề vì tiêu đề nằm ngay dưới thẻ (chủ dự án chọn bỏ trùng lặp, plan D6b);
//    thẻ og.png dùng khi chia sẻ thì vẫn có tiêu đề.
//
// Cỡ chữ dùng đơn vị `cqw` (% bề ngang của chính thẻ) nên thẻ co giãn đúng ở mọi kích
// thước mà không cần media query — `containerType: "inline-size"` biến thẻ thành container.
export default function PostCover({ post }: { post: Post }) {
  if (post.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh đã nén lúc build, không cần next/image
      <img
        src={post.cover.url}
        width={post.cover.width}
        height={post.cover.height}
        alt={post.title}
        loading="lazy"
        decoding="async"
        className="block aspect-[1200/630] w-full rounded-lg border border-border object-cover"
      />
    );
  }

  const p = pillars[post.pillar];
  return (
    <div
      aria-hidden
      className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg text-white"
      style={{
        containerType: "inline-size",
        backgroundImage: `linear-gradient(135deg, ${p.from}, ${p.to})`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          right: "-7cqw",
          bottom: "-13cqw",
          width: "38cqw",
          height: "38cqw",
          border: "3.6cqw solid rgb(255 255 255 / 0.11)",
        }}
      />
      <div
        className="absolute flex h-full w-full flex-col justify-between"
        style={{ padding: "5cqw 5.2cqw" }}
      >
        <span className="font-bold tracking-tight" style={{ fontSize: "3cqw" }}>
          họcphí.info
        </span>
        <span
          className="font-bold uppercase"
          style={{ fontSize: "4.6cqw", letterSpacing: "0.12em", opacity: 0.9 }}
        >
          {p.label}
        </span>
      </div>
    </div>
  );
}
