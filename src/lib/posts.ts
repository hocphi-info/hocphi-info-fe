// Lớp dữ liệu bài viết. Chỉ HAI hàm lấy dữ liệu (getAllPosts, getPostBySlug) để
// sau này nếu chuyển bài sang DB thì chỉ sửa file này (xem plan D1).
//
// `@/generated/posts.json` do scripts/blog/build.mjs sinh ra lúc build từ
// content/bai-viet (npm hook predev/pretypecheck/prebuild). Nó được import tĩnh
// nên nằm sẵn trong bundle — Cloudflare Workers không có đĩa để đọc file .md lúc
// chạy. Bản production KHÔNG chứa bài nháp (build.mjs loại ở nguồn).

import generated from "@/generated/posts.json";
import pillars from "@/lib/pillars.json";
import { AUTHOR_NAME, AUTHOR_ROLE, absoluteUrl } from "@/lib/site";

export type PillarKey = "data" | "research" | "news";

export type Post = {
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD — giữ là chuỗi, không qua Date (tránh lệch múi giờ). */
  date: string;
  updated: string | null;
  pillar: PillarKey;
  author: string | null;
  cover: { url: string; width: number; height: number } | null;
  ogImage: string;
  scope: string | null;
  related: { label: string; href: string }[];
  sources: { name: string; url: string; accessed: string }[];
  readingMinutes: number;
  headings: { id: string; text: string }[];
  /** HTML đã render sẵn từ Markdown (nội dung do chính chủ dự án viết, đã qua kiểm tra). */
  html: string;
  draft: boolean;
  relatedSlugs: string[];
};

// JSON rỗng ([]) được TS suy ra kiểu never[] nên phải ép kiểu qua unknown.
const POSTS = generated as unknown as Post[];

/** Mới nhất trước (đã sắp sẵn lúc build). */
export function getAllPosts(): Post[] {
  return POSTS;
}

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post): Post[] {
  return post.relatedSlugs
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is Post => p !== undefined);
}

export function pillarLabel(key: PillarKey): string {
  return pillars[key].label;
}

/** Tên + vai trò tác giả: ghi đè `author` thì không kèm vai trò mặc định. */
export function postAuthor(post: Post): { name: string; role: string | null } {
  return post.author
    ? { name: post.author, role: null }
    : { name: AUTHOR_NAME, role: AUTHOR_ROLE };
}

/** "2026-10-10" → "10/10/2026" (cắt chuỗi, không dùng Date). */
export function formatPostDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function postPath(slug: string): string {
  return `/bai-viet/${slug}`;
}

export function postUrl(slug: string): string {
  return absoluteUrl(postPath(slug));
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Intent chính thức của Threads (developers.facebook.com/docs/threads/threads-web-intents). */
export function threadsShareUrl(url: string, text: string): string {
  return `https://www.threads.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
