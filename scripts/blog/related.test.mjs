import assert from "node:assert/strict";
import { test } from "node:test";

import { pickRelated } from "./lib/related.mjs";

// đã sắp mới nhất → cũ nhất
const posts = [
  { slug: "p1", pillar: "data" },
  { slug: "p2", pillar: "news" },
  { slug: "p3", pillar: "data" },
  { slug: "p4", pillar: "research" },
  { slug: "p5", pillar: "data" },
];

test("ưu tiên cùng nhóm, mới nhất trước, tối đa 3, không tự liên quan", () => {
  assert.deepEqual(pickRelated(posts, "p1"), ["p3", "p5", "p2"]);
});

test("thiếu cùng nhóm thì bù bằng bài mới nhất còn lại", () => {
  assert.deepEqual(pickRelated(posts, "p4"), ["p1", "p2", "p3"]);
});

test("chỉ có 1 bài → rỗng", () => {
  assert.deepEqual(pickRelated([{ slug: "a", pillar: "data" }], "a"), []);
});

test("slug không tồn tại → rỗng", () => {
  assert.deepEqual(pickRelated(posts, "khong-co"), []);
});
