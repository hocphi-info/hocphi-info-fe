// Bỏ dấu tiếng Việt + ghép bằng "-". Cùng ý tưởng với src/lib/text.ts::normalize
// (lowercase → NFD tách dấu → xoá dấu → đ→d), lặp lại ở đây vì script .mjs của Node
// không import được file .ts của app.

export function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// slug thư mục bài: chữ thường không dấu, số, gạch nối; không bắt đầu/kết thúc bằng "-".
export function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
