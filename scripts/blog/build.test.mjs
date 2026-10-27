import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { runBuild } from "./build.mjs";
import { makePng, postFile, validFrontmatter } from "./fixtures.mjs";

const BUILD = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "build.mjs",
);

function makeRoot(posts = {}, extra = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-build-"));
  const content = path.join(root, "content", "bai-viet");
  fs.mkdirSync(content, { recursive: true });
  for (const [slug, files] of Object.entries(posts)) {
    for (const [name, data] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(content, slug, name)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(content, slug, name), data);
    }
  }
  for (const [name, data] of Object.entries(extra)) {
    fs.writeFileSync(path.join(content, name), data);
  }
  return root;
}
const opts = (root, o = {}) => ({ root, links: false, og: false, ...o });
const errorsOf = (r) => r.issues.filter((i) => i.level === "error");
const readPosts = (root) =>
  JSON.parse(
    fs.readFileSync(path.join(root, "src", "generated", "posts.json"), "utf8"),
  );

const body = "## Mục một\n\nNội dung.\n\n![Biểu đồ](bieu-do.png)\n";

test("bài hợp lệ → ghi posts.json và chép ảnh, bỏ qua bài nháp", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), body),
      "bieu-do.png": makePng(600),
    },
    "bai-nhap": {
      "index.md": postFile(
        validFrontmatter({ draft: true, date: "2026-10-11" }),
        body,
      ),
      "bieu-do.png": makePng(600),
    },
  });
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0, JSON.stringify(r.issues));
  const posts = readPosts(root);
  assert.deepEqual(
    posts.map((p) => p.slug),
    ["bai-a"],
  );
  assert.match(posts[0].html, /\/media\/bai-viet\/bai-a\/bieu-do\.png/);
  assert.equal(posts[0].ogImage, "/media/bai-viet/bai-a/og.png");
  assert.ok(
    fs.existsSync(path.join(root, "public/media/bai-viet/bai-a/bieu-do.png")),
  );
  assert.ok(!fs.existsSync(path.join(root, "public/media/bai-viet/bai-nhap")));
  assert.ok(!JSON.stringify(posts).includes("bai-nhap"));
});

test("bài ẩn (unlisted) vẫn vào posts.json nhưng không được bài khác gợi ý", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), body),
      "bieu-do.png": makePng(600),
    },
    "bai-an": {
      "index.md": postFile(
        validFrontmatter({ unlisted: true, date: "2026-10-11" }),
        body,
      ),
      "bieu-do.png": makePng(600),
    },
  });
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0, JSON.stringify(r.issues));
  const posts = readPosts(root);
  const an = posts.find((p) => p.slug === "bai-an");
  const a = posts.find((p) => p.slug === "bai-a");
  assert.equal(an.unlisted, true);
  assert.equal(a.unlisted, false);
  assert.deepEqual(a.relatedSlugs, []);
  assert.deepEqual(an.relatedSlugs, ["bai-a"]);
});

test("--drafts đưa bài nháp vào bản dev", async () => {
  const root = makeRoot({
    "bai-nhap": {
      "index.md": postFile(validFrontmatter({ draft: true }), body),
      "bieu-do.png": makePng(600),
    },
  });
  await runBuild(opts(root, { drafts: true }));
  const posts = readPosts(root);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].draft, true);
  assert.ok(
    fs.existsSync(
      path.join(root, "public/media/bai-viet/bai-nhap/bieu-do.png"),
    ),
  );
});

test("lỗi trong bài đăng → không ghi posts.json", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\n![](bieu-do.png)\n"),
      "bieu-do.png": makePng(600),
    },
  });
  const r = await runBuild(opts(root));
  assert.ok(errorsOf(r).some((i) => i.message.includes("alt")));
  assert.ok(!fs.existsSync(path.join(root, "src/generated/posts.json")));
});

test("bài nháp viết dở: lỗi hạ thành cảnh báo, không chặn bài khác", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
    },
    "dang-viet": { "index.md": "---\ndraft: true\n---\n\nmới viết dòng đầu\n" },
  });
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0, JSON.stringify(r.issues));
  assert.ok(
    r.issues.some(
      (i) => i.slug === "dang-viet" && i.message.startsWith("[nháp]"),
    ),
  );
  assert.deepEqual(
    readPosts(root).map((p) => p.slug),
    ["bai-a"],
  );
});

test("slug đã đăng bị xoá mà không redirect → lỗi và không ghi gì", async () => {
  const root = makeRoot(
    {
      "bai-a": {
        "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
      },
    },
    {
      "published.json": JSON.stringify([
        { slug: "bai-cu", publishedOn: "2026-09-01" },
      ]),
    },
  );
  const r = await runBuild(opts(root));
  assert.ok(errorsOf(r).some((i) => i.message.includes("bai-cu")));
  assert.ok(!fs.existsSync(path.join(root, "src/generated/posts.json")));
});

test("có redirect cho slug cũ → qua", async () => {
  const root = makeRoot(
    {
      "bai-a": {
        "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
      },
    },
    {
      "published.json": JSON.stringify([
        { slug: "bai-cu", publishedOn: "2026-09-01" },
      ]),
      "redirects.json": JSON.stringify({
        redirects: [{ from: "bai-cu", to: "bai-a" }],
        gone: [],
      }),
    },
  );
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0, JSON.stringify(r.issues));
});

test("thư mục ảnh của slug không còn trong bản build bị dọn", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
    },
  });
  const stale = path.join(root, "public/media/bai-viet/bai-bi-xoa");
  fs.mkdirSync(stale, { recursive: true });
  fs.writeFileSync(path.join(stale, "x.png"), "x");
  await runBuild(opts(root));
  assert.ok(!fs.existsSync(stale));
});

test("ảnh nằm trong thư mục bài nhưng không dùng → cảnh báo", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
      "thua.png": makePng(600),
    },
  });
  const r = await runBuild(opts(root));
  assert.ok(
    r.issues.some((i) => i.level === "warn" && i.message.includes("thua.png")),
  );
  assert.ok(
    !fs.existsSync(path.join(root, "public/media/bai-viet/bai-a/thua.png")),
  );
});

test("ảnh 320 KB → lỗi", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), body),
      "bieu-do.png": makePng(320 * 1024),
    },
  });
  const r = await runBuild(opts(root));
  assert.ok(errorsOf(r).some((i) => i.message.includes("KB")));
});

test("cover: dùng làm ảnh bìa và chép sang public", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(
        validFrontmatter({ cover: "cover.png" }),
        "## Mục\n\nNội dung.\n",
      ),
      "cover.png": makePng(600),
    },
  });
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0, JSON.stringify(r.issues));
  assert.equal(readPosts(root)[0].cover.url, "/media/bai-viet/bai-a/cover.png");
  assert.ok(
    fs.existsSync(path.join(root, "public/media/bai-viet/bai-a/cover.png")),
  );
});

test("tên thư mục sai (viết hoa/dấu) → lỗi; thư mục _template bị bỏ qua", async () => {
  const root = makeRoot({
    "Bai-Sai": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
    },
    _template: { "index.md": "không đọc" },
  });
  const r = await runBuild(opts(root));
  assert.ok(errorsOf(r).some((i) => i.slug === "Bai-Sai"));
  assert.ok(!r.issues.some((i) => i.slug === "_template"));
});

test("sắp xếp mới nhất trước và tính bài liên quan", async () => {
  const mk = (date, pillar) => ({
    "index.md": postFile(
      validFrontmatter({ date, pillar, scope: "phạm vi" }),
      "## Mục\n\nNội dung.\n",
    ),
  });
  const root = makeRoot({
    "bai-cu": mk("2026-09-01", "data"),
    "bai-moi": mk("2026-10-05", "data"),
    "bai-tin": mk("2026-09-20", "news"),
  });
  await runBuild(opts(root));
  const posts = readPosts(root);
  assert.deepEqual(
    posts.map((p) => p.slug),
    ["bai-moi", "bai-tin", "bai-cu"],
  );
  assert.deepEqual(posts[0].relatedSlugs, ["bai-cu", "bai-tin"]);
});

test("CLI: lỗi → mã thoát 1; sạch → mã thoát 0", () => {
  const bad = makeRoot({
    "bai-a": { "index.md": "---\ntitle: x\n---\n\nnội dung\n" },
  });
  const r1 = spawnSync(
    process.execPath,
    [BUILD, `--root=${bad}`, "--no-og", "--no-links"],
    {
      encoding: "utf8",
    },
  );
  assert.equal(r1.status, 1);
  assert.match(r1.stdout, /✖/);
  const good = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
    },
  });
  const r2 = spawnSync(
    process.execPath,
    [BUILD, `--root=${good}`, "--no-og", "--no-links"],
    {
      encoding: "utf8",
    },
  );
  assert.equal(r2.status, 0, r2.stdout + r2.stderr);
});

test("--check-only không ghi gì", async () => {
  const root = makeRoot({
    "bai-a": {
      "index.md": postFile(validFrontmatter(), "## Mục\n\nNội dung.\n"),
    },
  });
  await runBuild(opts(root, { checkOnly: true }));
  assert.ok(!fs.existsSync(path.join(root, "src")));
  assert.ok(!fs.existsSync(path.join(root, "public")));
});

test("không có thư mục content → 0 bài, không lỗi", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-empty-"));
  const r = await runBuild(opts(root));
  assert.equal(errorsOf(r).length, 0);
  assert.deepEqual(readPosts(root), []);
});
