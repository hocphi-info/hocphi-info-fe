#!/usr/bin/env node
// make blog-new SLUG=ten-bai-viet → tạo content/bai-viet/<slug>/index.md từ _template.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isValidSlug } from "./lib/slug.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const contentDir = path.join(root, "content", "bai-viet");
const slug = process.argv[2];

if (!slug || !isValidSlug(slug)) {
  console.error(
    "Cần slug hợp lệ: chữ thường không dấu, số, gạch nối. Ví dụ: make blog-new SLUG=hoc-phi-nganh-luat",
  );
  process.exit(1);
}

const dir = path.join(contentDir, slug);
if (fs.existsSync(dir)) {
  console.error(`Đã có thư mục content/bai-viet/${slug}. Chọn slug khác.`);
  process.exit(1);
}

const today = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Asia/Ho_Chi_Minh",
});
const template = fs.readFileSync(
  path.join(contentDir, "_template", "index.md"),
  "utf8",
);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "index.md"),
  template.replaceAll("__DATE__", today),
);

console.log(`Đã tạo content/bai-viet/${slug}/index.md (đang là nháp).`);
console.log(
  "Việc tiếp theo: make blog-dev để xem trước, make blog-check để kiểm tra, rồi bỏ 'draft: true' và make blog để đăng.",
);
