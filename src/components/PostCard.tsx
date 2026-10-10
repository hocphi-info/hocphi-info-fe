import Link from "next/link";

import PillarPill from "@/components/PillarPill";
import PostCover from "@/components/PostCover";
import { type Post, formatPostDate, postAuthor, postPath } from "@/lib/posts";

// Server Component — một bài trong danh sách "Các bài trước".
// Dưới `sm`: hàng gọn (thumbnail 7rem + chữ) cho học sinh lướt trên điện thoại;
// từ `sm` trở lên: thẻ dọc (ảnh trên, chữ dưới) — đúng mockup BlogList / BlogListMobile.
export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="relative flex gap-3 rounded-xl border border-border bg-surface p-2.5 transition-colors hover:border-accent-border sm:flex-col sm:gap-3 sm:p-3">
      <div className="w-28 shrink-0 sm:w-full">
        <PostCover post={post} />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2 sm:px-1 sm:pb-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
          <PillarPill pillar={post.pillar} />
          <time dateTime={post.date} className="hidden sm:inline">
            {formatPostDate(post.date)}
          </time>
        </div>
        <h3 className="text-sm font-bold leading-snug text-ink sm:text-base">
          {/* Link phủ cả thẻ (::after) để bấm đâu cũng vào bài, vẫn là một <a> duy nhất cho đọc màn hình. */}
          <Link
            href={postPath(post.slug)}
            className="line-clamp-3 after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>
        <p className="hidden line-clamp-3 text-sm leading-relaxed text-ink-2 sm:block">
          {post.summary}
        </p>
        <p className="text-xs text-ink-3">
          <time dateTime={post.date} className="sm:hidden">
            {formatPostDate(post.date)}
          </time>
          <span className="sm:hidden"> · </span>
          <span className="hidden sm:inline">{postAuthor(post).name} · </span>
          {post.readingMinutes} phút đọc
        </p>
      </div>
    </article>
  );
}
