// Hằng số dùng chung cho đường ống bài viết (scripts/blog/*).
// Các con số lấy từ plan docs/plans/2026-10-10-001-feat-bai-viet-blog-markdown-plan.md (D19).

export const PILLARS = ["data", "research", "news"];

export const LIMITS = {
  titleWarn: 80, // dài hơn → tràn thẻ chia sẻ
  titleMax: 120,
  summaryMin: 40,
  summaryMax: 320,
  imageWarnBytes: 150 * 1024,
  imageMaxBytes: 300 * 1024,
  // Gói Cloudflare Workers Free: bundle tối đa 3 MB sau nén, hiện đã ~1,08 MB.
  jsonGzipWarnBytes: 600 * 1024,
  wordsPerMinute: 200,
  coverRatio: 1200 / 630,
  coverRatioTolerance: 0.02,
};

export const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

// Ảnh trong bài được phục vụ như static asset ở đây (không phải /bai-viet/…,
// để không trùng đường dẫn với route trang). Xem plan D3.
export const MEDIA_PREFIX = "/media/bai-viet";

// related[].href chỉ được trỏ vào các trang tra cứu của chính site.
export const RELATED_HREF =
  /^\/(?:truong\/[a-z0-9]+(?:-[a-z0-9]+)*|nganh(?:\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*)?)(?:\?.*)?$/;

export const FRONTMATTER_KEYS = new Set([
  "title",
  "summary",
  "date",
  "updated",
  "pillar",
  "author",
  "cover",
  "draft",
  "scope",
  "related",
  "sources",
]);
