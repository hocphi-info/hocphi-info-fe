import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { imageSize } from "image-size";

import {
  generateOgImages,
  ogCacheKey,
  renderOgPng,
  titleFontSize,
} from "./lib/og.mjs";

const post = (over = {}) => ({
  slug: "bai-a",
  title: "Học CNTT đại trà: 4 trường, chênh nhau bao nhiêu tiền?",
  pillar: "data",
  cover: null,
  ...over,
});

test("renderOgPng ra PNG đúng 1200×630 cho cả 3 nhóm", async () => {
  for (const pillar of ["data", "research", "news"]) {
    const png = await renderOgPng(post({ pillar }));
    assert.deepEqual(
      { w: imageSize(png).width, h: imageSize(png).height },
      { w: 1200, h: 630 },
    );
  }
});

test("tiêu đề rất dài vẫn dựng được (không ném lỗi)", async () => {
  const png = await renderOgPng(post({ title: "Rất dài ".repeat(40) }));
  assert.equal(imageSize(png).width, 1200);
});

test("cỡ chữ giảm khi tiêu đề dài", () => {
  assert.equal(titleFontSize("a".repeat(50)), 66);
  assert.equal(titleFontSize("a".repeat(75)), 58);
  assert.equal(titleFontSize("a".repeat(95)), 50);
});

test("khoá bộ nhớ đệm đổi theo tiêu đề/nhóm, không đổi theo nội dung khác", () => {
  const base = ogCacheKey(post());
  assert.notEqual(base, ogCacheKey(post({ title: "Tiêu đề khác" })));
  assert.notEqual(base, ogCacheKey(post({ pillar: "news" })));
  assert.equal(
    base,
    ogCacheKey(post({ html: "<p>đã sửa thân bài</p>", summary: "khác" })),
  );
});

test("generateOgImages: ghi og.png, dùng lại bộ nhớ đệm, bỏ qua bài có cover", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-og-"));
  const posts = [
    post(),
    post({ slug: "bai-co-cover", cover: { url: "/x.png" } }),
  ];
  assert.deepEqual(await generateOgImages({ root, posts }), []);
  const out = path.join(root, "public/media/bai-viet/bai-a/og.png");
  assert.ok(fs.existsSync(out));
  assert.ok(
    !fs.existsSync(
      path.join(root, "public/media/bai-viet/bai-co-cover/og.png"),
    ),
  );

  const cacheDir = path.join(root, "node_modules/.cache/blog-og");
  const [cached] = fs.readdirSync(cacheDir);
  const before = fs.statSync(path.join(cacheDir, cached)).mtimeMs;
  await new Promise((r) => setTimeout(r, 20));
  await generateOgImages({ root, posts });
  assert.equal(fs.statSync(path.join(cacheDir, cached)).mtimeMs, before);
});
