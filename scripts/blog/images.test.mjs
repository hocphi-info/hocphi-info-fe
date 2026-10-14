import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { coverRatioWarning, createImageResolver } from "./lib/images.mjs";
import { makePng } from "./fixtures.mjs";

function setup(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-img-"));
  for (const [name, buf] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf);
  }
  return createImageResolver({ dir, slug: "demo" });
}

test("ảnh hợp lệ → URL phục vụ + kích thước", () => {
  const resolve = setup({ "a.png": makePng(600) });
  const r = resolve("a.png");
  assert.ok(r.ok);
  assert.equal(r.url, "/media/bai-viet/demo/a.png");
  assert.ok(r.width > 0 && r.height > 0);
  assert.equal(r.warnings.length, 0);
});

test("ảnh trong thư mục con vẫn dùng được", () => {
  const resolve = setup({ "img/a.png": makePng(600) });
  assert.equal(resolve("img/a.png").url, "/media/bai-viet/demo/img/a.png");
});

test("151 KB → cảnh báo; 301 KB → lỗi", () => {
  const warn = setup({ "a.png": makePng(160 * 1024) })("a.png");
  assert.ok(warn.ok);
  assert.equal(warn.warnings.length, 1);
  const big = setup({ "a.png": makePng(320 * 1024) })("a.png");
  assert.equal(big.ok, false);
  assert.match(big.error, /KB/);
});

test("định dạng không hỗ trợ (.svg), thiếu file, ra ngoài thư mục → lỗi", () => {
  const resolve = setup({ "a.svg": Buffer.from("<svg/>") });
  assert.equal(resolve("a.svg").ok, false);
  assert.equal(resolve("khong-co.png").ok, false);
  assert.equal(resolve("../x.png").ok, false);
});

test("đường dẫn tuyệt đối/ngoài site → external", () => {
  const resolve = setup({});
  assert.equal(resolve("https://cdn.example/a.png").external, true);
  assert.equal(resolve("/a.png").external, true);
});

test("file .png hỏng → lỗi không ném", () => {
  const resolve = setup({ "a.png": Buffer.from("khong-phai-anh") });
  assert.equal(resolve("a.png").ok, false);
});

test("tỉ lệ ảnh bìa: 1200×630 ổn, 1000×1000 cảnh báo", () => {
  assert.equal(coverRatioWarning(1200, 630), null);
  assert.match(coverRatioWarning(1000, 1000), /1,91:1/);
});
