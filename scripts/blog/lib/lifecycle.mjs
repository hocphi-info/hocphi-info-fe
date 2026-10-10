// Vòng đời slug (plan D9): URL đã đăng không được tự chết.
//
//  - published.json: danh sách CHỈ THÊM các slug đã từng lên production
//    (do `make blog` ghi sau khi deploy thành công).
//  - redirects.json: { redirects: [{ from, to }], gone: [slug] }
//      redirects → 308 từ /bai-viet/<from> sang /bai-viet/<to> (to phải là bài đang sống)
//      gone      → chủ động gỡ bài (trang trả 404)
//
// Hàm thuần: nhận dữ liệu đã đọc, trả danh sách { level, message }.

import { isValidSlug } from "./slug.mjs";

export function checkLifecycle({ live, published, redirects }) {
  const issues = [];
  const err = (message) => issues.push({ level: "error", message });

  const liveSet = new Set(live);
  const redirectList = Array.isArray(redirects?.redirects)
    ? redirects.redirects
    : [];
  const goneList = Array.isArray(redirects?.gone) ? redirects.gone : [];

  const redirectFrom = new Map();
  redirectList.forEach((r, i) => {
    if (
      !r ||
      typeof r.from !== "string" ||
      typeof r.to !== "string" ||
      !isValidSlug(r.from) ||
      !isValidSlug(r.to)
    ) {
      err(
        `redirects.json: redirects[${i}] cần dạng { "from": slug, "to": slug }.`,
      );
      return;
    }
    if (redirectFrom.has(r.from)) {
      err(`redirects.json: slug cũ "${r.from}" khai báo chuyển hướng 2 lần.`);
    }
    redirectFrom.set(r.from, r.to);
    if (liveSet.has(r.from)) {
      err(
        `redirects.json: "${r.from}" vẫn là một bài đang đăng nên không thể chuyển hướng đi chỗ khác. Xoá dòng này hoặc đổi tên/xoá bài.`,
      );
    }
    if (!liveSet.has(r.to)) {
      err(
        `redirects.json: "${r.from}" chuyển tới "${r.to}" nhưng đó không phải bài đang đăng.`,
      );
    }
  });

  const goneSet = new Set();
  goneList.forEach((slug, i) => {
    if (typeof slug !== "string" || !isValidSlug(slug)) {
      err(`redirects.json: gone[${i}] phải là slug hợp lệ.`);
      return;
    }
    goneSet.add(slug);
    if (liveSet.has(slug)) {
      err(
        `redirects.json: "${slug}" nằm trong "gone" nhưng vẫn là bài đang đăng. Xoá khỏi "gone" hoặc gỡ bài.`,
      );
    }
    if (redirectFrom.has(slug)) {
      err(`redirects.json: "${slug}" vừa có trong "gone" vừa có redirect.`);
    }
  });

  for (const entry of published) {
    const slug = entry?.slug;
    if (typeof slug !== "string") {
      err("published.json: có mục không có slug.");
      continue;
    }
    if (liveSet.has(slug) || redirectFrom.has(slug) || goneSet.has(slug))
      continue;
    err(
      `Bài "${slug}" đã từng đăng nhưng không còn (bị xoá, đổi tên hoặc chuyển thành nháp) và chưa có chuyển hướng. ` +
        `URL /bai-viet/${slug} sẽ chết. Thêm vào content/bai-viet/redirects.json ("redirects": { "from": "${slug}", "to": "<slug mới>" } hoặc "gone": ["${slug}"]).`,
    );
  }

  return issues;
}
