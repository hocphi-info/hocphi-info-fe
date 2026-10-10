import assert from "node:assert/strict";
import { test } from "node:test";

import { toDateString, validateFrontmatter } from "./lib/frontmatter.mjs";
import { validFrontmatter } from "./fixtures.mjs";

const errors = (r) =>
  r.issues.filter((i) => i.level === "error").map((i) => i.message);
const warns = (r) =>
  r.issues.filter((i) => i.level === "warn").map((i) => i.message);

test("front matter hợp lệ → có value, không lỗi", () => {
  const r = validateFrontmatter(validFrontmatter());
  assert.equal(errors(r).length, 0);
  assert.equal(r.value.pillar, "data");
  assert.equal(r.value.draft, false);
  assert.equal(r.value.author, null);
});

for (const key of ["title", "summary", "date", "pillar", "sources"]) {
  test(`thiếu "${key}" → lỗi`, () => {
    const data = validFrontmatter();
    delete data[key];
    const r = validateFrontmatter(data);
    assert.equal(r.value, null);
    assert.ok(
      errors(r).some((m) => m.includes(key)),
      errors(r).join("|"),
    );
  });
}

test("ngày không hợp lệ → lỗi; ngày lịch sai (30/02) → lỗi", () => {
  assert.equal(toDateString("2026-02-30"), null);
  assert.equal(toDateString("10/10/2026"), null);
  assert.equal(toDateString("2026-10-10"), "2026-10-10");
  assert.equal(toDateString(new Date("2026-10-10T00:00:00Z")), "2026-10-10");
  assert.ok(
    errors(validateFrontmatter(validFrontmatter({ date: "10/10/2026" })))
      .length > 0,
  );
});

test('"updated" sớm hơn "date" → lỗi', () => {
  const r = validateFrontmatter(validFrontmatter({ updated: "2026-10-01" }));
  assert.ok(errors(r).some((m) => m.includes("updated")));
});

test("pillar lạ → lỗi", () => {
  const r = validateFrontmatter(validFrontmatter({ pillar: "blog" }));
  assert.ok(errors(r).some((m) => m.includes("pillar")));
});

test('bài "data" thiếu scope → lỗi; bài "research" không cần', () => {
  const data = validFrontmatter();
  delete data.scope;
  assert.ok(errors(validateFrontmatter(data)).some((m) => m.includes("scope")));
  assert.equal(
    errors(validateFrontmatter({ ...data, pillar: "research" })).length,
    0,
  );
});

test("sources: URL sai và thiếu ngày đối chiếu → lỗi", () => {
  const r = validateFrontmatter(
    validFrontmatter({
      sources: [{ name: "x", url: "khong-phai-url", accessed: "hôm qua" }],
    }),
  );
  assert.ok(errors(r).some((m) => m.includes("url")));
  assert.ok(errors(r).some((m) => m.includes("accessed")));
});

test("sources rỗng → lỗi", () => {
  assert.ok(
    errors(validateFrontmatter(validFrontmatter({ sources: [] }))).length > 0,
  );
});

test("title 81 ký tự → cảnh báo; 121 ký tự → lỗi", () => {
  const warn = validateFrontmatter(validFrontmatter({ title: "a".repeat(81) }));
  assert.equal(errors(warn).length, 0);
  assert.ok(warns(warn).some((m) => m.includes("81")));
  const bad = validateFrontmatter(validFrontmatter({ title: "a".repeat(121) }));
  assert.ok(errors(bad).some((m) => m.includes("121")));
});

test("related: href ngoài các trang tra cứu → lỗi; href đúng dạng → qua", () => {
  const bad = validateFrontmatter(
    validFrontmatter({
      related: [{ label: "x", href: "https://evil.example" }],
    }),
  );
  assert.ok(errors(bad).some((m) => m.includes("related[0]")));
  const ok = validateFrontmatter(
    validFrontmatter({
      related: [
        { label: "BK", href: "/truong/dh-bach-khoa-tphcm" },
        { label: "Luật", href: "/nganh/dh-luat-tphcm/luat" },
        { label: "Tra cứu", href: "/nganh?q=cntt" },
      ],
    }),
  );
  assert.equal(errors(ok).length, 0);
  assert.equal(ok.value.related.length, 3);
});

test("trường lạ → cảnh báo (không lỗi)", () => {
  const r = validateFrontmatter(validFrontmatter({ titel: "gõ sai" }));
  assert.equal(errors(r).length, 0);
  assert.ok(warns(r).some((m) => m.includes("titel")));
});

test('"draft" không phải boolean → lỗi', () => {
  assert.ok(
    errors(validateFrontmatter(validFrontmatter({ draft: "yes" }))).length > 0,
  );
});
