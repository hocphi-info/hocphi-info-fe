import assert from "node:assert/strict";
import { test } from "node:test";

import { renderMarkdown } from "./lib/render.mjs";

const okImage = (src) => ({
  ok: true,
  rel: src,
  url: `/media/bai-viet/demo/${src}`,
  width: 800,
  height: 400,
  warnings: [],
});
const render = (md, resolveImage = okImage) =>
  renderMarkdown(md, { resolveImage });
const errors = (r) =>
  r.issues.filter((i) => i.level === "error").map((i) => i.message);

test("ảnh có alt: viết lại đường dẫn, gắn width/height/lazy", () => {
  const r = render("![Biểu đồ cột](bieu-do.webp)");
  assert.equal(errors(r).length, 0);
  assert.match(r.html, /src="\/media\/bai-viet\/demo\/bieu-do\.webp"/);
  assert.match(r.html, /width="800"/);
  assert.match(r.html, /height="400"/);
  assert.match(r.html, /loading="lazy"/);
  assert.deepEqual(r.images, ["bieu-do.webp"]);
});

test("ảnh không alt → lỗi", () => {
  const r = render("![](bieu-do.webp)");
  assert.ok(errors(r).some((m) => m.includes("alt")));
});

test("ảnh không tìm thấy → lỗi từ resolver được chuyển lên", () => {
  const r = render("![mô tả](thieu.webp)", () => ({
    ok: false,
    error: "Không tìm thấy ảnh",
  }));
  assert.ok(errors(r).includes("Không tìm thấy ảnh"));
});

test("ảnh ngoài site → chỉ cảnh báo", () => {
  const r = render("![mô tả](https://cdn.example/a.png)", () => ({
    ok: false,
    external: true,
    error: "ảnh ngoài",
  }));
  assert.equal(errors(r).length, 0);
  assert.ok(r.issues.some((i) => i.level === "warn"));
});

test("HTML thô bị báo lỗi và được thoát ký tự", () => {
  const r = render("Xin chào <script>alert(1)</script>\n\n<div>khối</div>");
  assert.ok(errors(r).length >= 1);
  assert.ok(!r.html.includes("<script>"));
  assert.ok(!r.html.includes("<div>khối"));
});

test("bảng được bọc vùng cuộn và th có scope", () => {
  const r = render("| A | B |\n|---|---|\n| 1 | 2 |");
  assert.match(r.html, /<div class="table-scroll" role="region" tabindex="0"/);
  assert.match(r.html, /<th scope="col">A<\/th>/);
  assert.match(r.html, /<\/table>\s*<\/div>/);
});

test("h2 có id không dấu; trùng chữ thì thêm số; vào danh sách mục lục", () => {
  const r = render("## Bảng so sánh\n\ntext\n\n## Bảng so sánh\n\ntext");
  assert.deepEqual(
    r.headings.map((h) => h.id),
    ["bang-so-sanh", "bang-so-sanh-2"],
  );
  assert.match(r.html, /<h2 id="bang-so-sanh">/);
});

test("h1 trong thân bài → lỗi", () => {
  const r = render("# Tiêu đề lại");
  assert.ok(errors(r).some((m) => m.includes("h1")));
});

test("nhảy cấp heading (h2 → h4) → cảnh báo", () => {
  const r = render("## A\n\n#### B");
  assert.equal(errors(r).length, 0);
  assert.ok(
    r.issues.some((i) => i.level === "warn" && i.message.includes("h4")),
  );
});

test("liên kết ngoài có rel noopener noreferrer; liên kết nội bộ thì không", () => {
  const r = render("[ngoài](https://example.edu.vn) và [trong](/nganh)");
  assert.match(
    r.html,
    /href="https:\/\/example\.edu\.vn" rel="noopener noreferrer"/,
  );
  assert.doesNotMatch(r.html, /href="\/nganh" rel=/);
});

test("đếm từ và thời gian đọc (200 từ/phút, làm tròn lên, tối thiểu 1)", () => {
  assert.equal(render("một hai ba").readingMinutes, 1);
  const long = Array.from({ length: 450 }, () => "từ").join(" ");
  const r = render(long);
  assert.equal(r.wordCount, 450);
  assert.equal(r.readingMinutes, 3);
});

test("liên kết javascript: không được render thành <a>", () => {
  const r = render("[bấm](javascript:alert(1))");
  assert.ok(!r.html.includes('href="javascript:'));
});
