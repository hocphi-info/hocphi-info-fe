import type { Metadata } from "next";
import Link from "next/link";

import FollowLinks from "@/components/FollowLinks";
import PillarPill from "@/components/PillarPill";
import PostCard from "@/components/PostCard";
import PostCover from "@/components/PostCover";
import { formatPostDate, getAllPosts, postAuthor, postPath } from "@/lib/posts";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// Server Component, hoàn toàn tĩnh: danh sách lấy từ module sinh sẵn (lib/posts.ts),
// không gọi API. Bố cục theo ../mockup/BlogList.dc.html (desktop) và
// BlogListMobile.dc.html (mobile).

const DESCRIPTION =
  "Phân tích từ cơ sở dữ liệu hocphi.info, những câu hỏi chưa báo nào trả lời, và tin giáo dục nhìn qua góc học phí.";

export const metadata: Metadata = {
  title: "Bài viết",
  description: DESCRIPTION,
  alternates: {
    canonical: "/bai-viet",
    types: { "application/rss+xml": "/bai-viet/feed.xml" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    title: `Bài viết · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absoluteUrl("/bai-viet"),
  },
};

export default function PostsPage() {
  const posts = getAllPosts();
  const [latest, ...older] = posts;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-accent-strong">
            BÀI VIẾT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Học phí, nói bằng con số
          </h1>
          <p className="mt-3 leading-relaxed text-ink-2">
            {DESCRIPTION} Bài nào cũng ghi nguồn và phạm vi số liệu.
          </p>
        </div>
        <FollowLinks />
      </header>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-rule pb-6 text-sm text-ink-3">
        <li className="flex items-center gap-2">
          <PillarPill pillar="data" /> số liệu gốc từ cơ sở dữ liệu
        </li>
        <li className="flex items-center gap-2">
          <PillarPill pillar="research" /> câu hỏi chưa báo nào trả lời
        </li>
        <li className="flex items-center gap-2">
          <PillarPill pillar="news" /> thời sự, nhìn qua học phí
        </li>
      </ul>

      {!latest ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-semibold text-ink">Bài đầu tiên sắp ra mắt.</p>
          <p className="mt-1 text-sm text-ink-3">
            Theo dõi Facebook hoặc Threads để biết khi có bài mới.
          </p>
          <div className="mt-4 flex justify-center">
            <FollowLinks label="" primary />
          </div>
        </div>
      ) : (
        <>
          {/* Bài mới nhất */}
          <article className="relative mt-8 grid gap-5 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent-border md:grid-cols-[1.25fr_1fr] md:items-center md:gap-8 md:p-5">
            <PostCover post={latest} />
            <div className="flex flex-col gap-3 md:pr-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                <PillarPill pillar={latest.pillar} />
                <span>
                  Mới nhất ·{" "}
                  <time dateTime={latest.date}>
                    {formatPostDate(latest.date)}
                  </time>
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-snug text-ink">
                <Link
                  href={postPath(latest.slug)}
                  className="after:absolute after:inset-0"
                >
                  {latest.title}
                </Link>
              </h2>
              <p className="leading-relaxed text-ink-2">{latest.summary}</p>
              <p className="text-xs text-ink-3">
                {postAuthor(latest).name} · {latest.readingMinutes} phút đọc
              </p>
            </div>
          </article>

          {older.length > 0 ? (
            <section aria-labelledby="cac-bai-truoc">
              <h2
                id="cac-bai-truoc"
                className="mt-10 mb-4 text-xl font-bold text-ink"
              >
                Các bài trước
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {older.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ) : null}

          <aside className="mt-12 flex flex-col gap-4 rounded-xl border border-accent-border bg-accent-bg p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Đừng bỏ lỡ bài mới</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-2">
                Mỗi bài mới đều được đăng ngắn trên Facebook và Threads, kèm
                biểu đồ chính để bạn xem nhanh trước khi đọc bản đầy đủ.
              </p>
            </div>
            <FollowLinks label="" primary rss />
          </aside>
        </>
      )}
    </main>
  );
}
