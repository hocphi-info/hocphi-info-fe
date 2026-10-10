import assert from "node:assert/strict";
import { test } from "node:test";

import { isValidSlug, slugify } from "./lib/slug.mjs";

test("slugify bỏ dấu tiếng Việt và ghép bằng gạch nối", () => {
  assert.equal(slugify("Bảng so sánh"), "bang-so-sanh");
  assert.equal(slugify("Đại học Bách Khoa!!"), "dai-hoc-bach-khoa");
  assert.equal(slugify("  Vì sao lại chênh?  "), "vi-sao-lai-chenh");
});

test("slugify trả rỗng khi không còn ký tự hợp lệ", () => {
  assert.equal(slugify("???"), "");
});

test("isValidSlug chỉ nhận chữ thường không dấu, số, gạch nối", () => {
  assert.ok(isValidSlug("hoc-phi-2026"));
  assert.ok(!isValidSlug("Hoc-Phi"));
  assert.ok(!isValidSlug("học-phí"));
  assert.ok(!isValidSlug("-hoc-phi"));
  assert.ok(!isValidSlug("hoc--phi"));
  assert.ok(!isValidSlug("hoc_phi"));
});
