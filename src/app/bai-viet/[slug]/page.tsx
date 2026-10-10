import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Callout from "@/components/Callout";
import JsonLd from "@/components/JsonLd";
import PillarPill from "@/components/PillarPill";
import PostCard from "@/components/PostCard";
import ShareButtons from "@/components/ShareButtons";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  postAuthor,
  postPath,
  postUrl,
} from "@/lib/posts";
import { SITE_NAME, SITE_URL, absoluteUrl, mailtoUrl } from "@/lib/site";

// Server Component, dữ liệu hoàn toàn tĩnh (không gọi API). Bố cục theo
// ../mockup/BlogPost.dc.html (desktop) và BlogPostMobile.dc.html (mobile).
//
// KHÔNG đặt `dynamicParams = false` (đã thử, kiểm chứng bằng `wrangler dev`): trên Cloudflare
// Workers (OpenNext, bộ nhớ đệm "dummy") route chỉ-được-dựng-sẵn không tìm thấy bản dựng sẵn
// nên MỌI bài trả 404. Để mặc định (true): `next build` vẫn dựng sẵn các slug dưới đây, còn
// trên Worker trang được render lúc có request từ posts.json nằm trong bundle; slug lạ
// (hoặc bài nháp/đã gỡ — không có trong bản production) đi qua `notFound()` và trả 404 thật.
// Cố ý KHÔNG có loading.tsx/error.tsx ở route này: route có loading.tsx làm `notFound()`
// trả 200 thay vì 404 (lỗi đã biết của dự án), mà trang này không có gì để chờ.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/bai-viet/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const author = postAuthor(post).name;
  const image = post.cover
    ? { url: post.ogImage, width: post.cover.width, height: post.cover.height }
    : { url: post.ogImage, width: 1200, height: 630 };

  return {
    title: post.title,
    description: post.summary,
    // Canonical sạch: link có ?utm_… vẫn mở đúng bài nhưng chỉ có một URL được lập chỉ mục.
    alternates: { canonical: postPath(slug) },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "vi_VN",
      title: post.title,
      description: post.summary,
      url: postUrl(slug),
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [author],
      images: [{ ...image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [post.ogImage],
    },
  };
}

export default async function PostPage({
  params,
}: PageProps<"/bai-viet/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const author = postAuthor(post);
  const url = postUrl(post.slug);
  const related = getRelatedPosts(post);
  // Bài không khai báo `related` thì vẫn có đường sang tra cứu (R14).
  const lookupLinks =
    post.related.length > 0
      ? post.related
      : [{ label: "Tra cứu học phí các ngành", href: "/nganh" }];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: [absoluteUrl(post.ogImage)],
    inLanguage: "vi-VN",
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: url,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bài viết",
        item: absoluteUrl("/bai-viet"),
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />

      <nav
        aria-label="Breadcrumb"
        className="hidden flex-wrap gap-2 text-xs text-ink-3 sm:flex"
      >
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <span aria-hidden>›</span>
        <Link href="/bai-viet" className="hover:text-ink">
          Bài viết
        </Link>
        <span aria-hidden>›</span>
        <span className="text-ink-2">{post.title}</span>
      </nav>
      <Link
        href="/bai-viet"
        className="inline-flex items-center gap-1 text-sm text-accent-ink sm:hidden"
      >
        <span aria-hidden>‹</span> Bài viết
      </Link>

      <div className="mt-4 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16.5rem]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            <PillarPill pillar={post.pillar} />
            <span>{post.readingMinutes} phút đọc</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-on-accent"
            >
              {author.name.trim().split(/\s+/).pop()?.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-ink">
                {author.name}
                {author.role ? (
                  <span className="font-normal text-ink-3">
                    {" "}
                    · {author.role}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-ink-3">
                Đăng{" "}
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                {post.updated ? (
                  <>
                    {" "}
                    · Cập nhật{" "}
                    <time dateTime={post.updated}>
                      {formatPostDate(post.updated)}
                    </time>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          {/* Tóm tắt — trả lời trước, giải thích sau (R5) */}
          <div className="mt-6 rounded-r-lg border-l-[3px] border-accent bg-accent-bg px-4 py-3.5">
            <p className="text-[11px] font-bold tracking-widest text-accent-strong">
              TÓM TẮT
            </p>
            <p className="mt-1 leading-relaxed text-ink">{post.summary}</p>
          </div>

          {post.cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh đã nén lúc build
            <img
              src={post.cover.url}
              width={post.cover.width}
              height={post.cover.height}
              alt={post.title}
              className="mt-6 block h-auto w-full rounded-xl border border-border"
            />
          ) : null}

          {post.scope ? (
            <div className="mt-6">
              <Callout title="Phạm vi số liệu">{post.scope}</Callout>
            </div>
          ) : null}

          {/* Thân bài: HTML do scripts/blog/lib/render.mjs sinh từ Markdown của chính chủ
              dự án lúc build. HTML thô trong Markdown bị chặn (báo lỗi) và mọi token html
              vẫn được thoát ký tự, nên đây không phải đầu vào người dùng. */}
          <div
            className="post-body mt-6"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Liên kết sang sản phẩm chính (R14) */}
          <section
            aria-labelledby="tra-cuu-lien-quan"
            className="mt-8 rounded-xl border border-border bg-surface-2 p-5"
          >
            <h2 id="tra-cuu-lien-quan" className="text-lg font-bold text-ink">
              Tra cứu học phí liên quan
            </h2>
            <ul className="mt-3 grid gap-2.5">
              {lookupLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-umami-event="post-cta-lookup"
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent-border"
                  >
                    {link.label}
                    <span aria-hidden className="text-accent-ink">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Nguồn (R6) */}
          <section aria-labelledby="nguon" className="mt-8">
            <details
              open
              className="rounded-xl border border-border bg-surface px-4 py-3 sm:border-0 sm:bg-transparent sm:p-0"
            >
              <summary
                id="nguon"
                className="cursor-pointer text-lg font-bold text-ink sm:cursor-default"
              >
                Nguồn ({post.sources.length})
              </summary>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-ink underline underline-offset-2"
                    >
                      {s.name}
                    </a>{" "}
                    · đối chiếu {formatPostDate(s.accessed)}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-ink-3">
                Thấy số liệu chưa đúng?{" "}
                <a
                  href={mailtoUrl(
                    `[hocphi.info] Báo số liệu chưa đúng: ${post.title}`,
                  )}
                  className="text-accent-ink underline underline-offset-2"
                >
                  Báo cho chúng tôi qua email
                </a>
                .
              </p>
            </details>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-rule py-4">
            <span className="text-sm font-semibold text-ink">
              Thấy hữu ích? Chia sẻ cho bạn bè:
            </span>
            <ShareButtons url={url} title={post.title} />
          </div>

          <div className="mt-6 flex items-start gap-3.5">
            <div
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-on-accent"
            >
              {author.name.trim().split(/\s+/).pop()?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-ink">{author.name}</p>
              {author.role ? (
                <p className="text-xs text-ink-3">{author.role}</p>
              ) : null}
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                Làm hocphi.info để học phí đại học không còn là thứ phải đoán.
              </p>
            </div>
          </div>
        </article>

        {/* Cột phải (chỉ desktop): mục lục + chia sẻ + CTA, dính khi cuộn */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-7">
            {post.headings.length >= 3 ? (
              <nav aria-label="Mục lục">
                <p className="mb-2 text-[11px] font-bold tracking-widest text-ink-3">
                  TRONG BÀI NÀY
                </p>
                <ul>
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="block border-l-2 border-rule py-1 pl-3 text-sm text-ink-2 hover:border-accent hover:text-ink"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
            <div>
              <p className="mb-2 text-[11px] font-bold tracking-widest text-ink-3">
                CHIA SẺ
              </p>
              <ShareButtons url={url} title={post.title} vertical />
            </div>
            <div className="rounded-xl border border-accent-border bg-accent-bg p-4">
              <p className="text-sm font-semibold text-ink">
                Xem học phí của mọi trường
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">
                Bảng đầy đủ, lọc theo hệ đào tạo và thành phố.
              </p>
              <Link
                href="/nganh"
                data-umami-event="post-cta-lookup"
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:opacity-90"
              >
                Tra cứu ngay →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section
          aria-labelledby="bai-lien-quan"
          className="mt-12 border-t border-rule pt-8"
        >
          <h2 id="bai-lien-quan" className="mb-4 text-xl font-bold text-ink">
            Bài viết liên quan
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
