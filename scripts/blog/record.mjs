#!/usr/bin/env node
// Chạy bởi `make blog` SAU KHI deploy thành công: ghi các slug vừa lên production
// vào content/bai-viet/published.json (chỉ thêm, không bao giờ xoá). Nhờ file này,
// `blog-check` biết bài nào đã có URL công khai để chặn việc xoá/đổi tên nhầm.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const publishedFile = path.join(root, "content", "bai-viet", "published.json");
const postsFile = path.join(root, "src", "generated", "posts.json");

if (!fs.existsSync(postsFile)) {
  console.error("Không thấy src/generated/posts.json; chạy build trước.");
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, "utf8")).filter(
  (p) => !p.draft,
);
const published = fs.existsSync(publishedFile)
  ? JSON.parse(fs.readFileSync(publishedFile, "utf8"))
  : [];
const known = new Set(published.map((p) => p.slug));
const today = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Asia/Ho_Chi_Minh",
});

const added = posts.filter((p) => !known.has(p.slug)).map((p) => p.slug);
for (const slug of added) published.push({ slug, publishedOn: today });

if (added.length > 0) {
  fs.writeFileSync(publishedFile, JSON.stringify(published, null, 2) + "\n");
  console.log(
    `Đã ghi ${added.length} bài mới vào content/bai-viet/published.json: ${added.join(", ")}`,
  );
  console.log(
    "Nhớ sao lưu content/bai-viet/ (thư mục này không nằm trong git).",
  );
} else {
  console.log("Không có bài mới để ghi vào published.json.");
}
