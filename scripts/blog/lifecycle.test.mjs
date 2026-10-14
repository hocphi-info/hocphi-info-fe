import assert from "node:assert/strict";
import { test } from "node:test";

import { checkLifecycle } from "./lib/lifecycle.mjs";

const errors = (issues) =>
  issues.filter((i) => i.level === "error").map((i) => i.message);
const none = { redirects: [], gone: [] };

test("bài đã đăng và còn nguyên → qua", () => {
  const r = checkLifecycle({
    live: ["a"],
    published: [{ slug: "a" }],
    redirects: none,
  });
  assert.equal(errors(r).length, 0);
});

test("bài mới (chưa có trong published) → qua", () => {
  const r = checkLifecycle({
    live: ["a", "b"],
    published: [{ slug: "a" }],
    redirects: none,
  });
  assert.equal(errors(r).length, 0);
});

test("bài đã đăng bị xoá, không redirect → lỗi nêu rõ cách sửa", () => {
  const r = checkLifecycle({
    live: [],
    published: [{ slug: "a" }],
    redirects: none,
  });
  assert.equal(errors(r).length, 1);
  assert.match(errors(r)[0], /redirects\.json/);
});

test("bài đã đăng chuyển thành nháp (không còn live) → lỗi", () => {
  const r = checkLifecycle({
    live: ["b"],
    published: [{ slug: "a" }],
    redirects: none,
  });
  assert.equal(errors(r).length, 1);
});

test("đổi slug có redirect tới bài đang sống → qua", () => {
  const r = checkLifecycle({
    live: ["moi"],
    published: [{ slug: "cu" }],
    redirects: { redirects: [{ from: "cu", to: "moi" }], gone: [] },
  });
  assert.equal(errors(r).length, 0);
});

test("redirect tới bài không tồn tại → lỗi", () => {
  const r = checkLifecycle({
    live: [],
    published: [{ slug: "cu" }],
    redirects: { redirects: [{ from: "cu", to: "khong-co" }], gone: [] },
  });
  assert.ok(errors(r).some((m) => m.includes("khong-co")));
});

test('redirect "from" trùng slug đang sống → lỗi', () => {
  const r = checkLifecycle({
    live: ["a", "b"],
    published: [],
    redirects: { redirects: [{ from: "a", to: "b" }], gone: [] },
  });
  assert.ok(errors(r).some((m) => m.includes('"a"')));
});

test('chủ động gỡ bài bằng "gone" → qua; nhưng "gone" mà bài vẫn sống → lỗi', () => {
  const ok = checkLifecycle({
    live: [],
    published: [{ slug: "a" }],
    redirects: { redirects: [], gone: ["a"] },
  });
  assert.equal(errors(ok).length, 0);
  const bad = checkLifecycle({
    live: ["a"],
    published: [{ slug: "a" }],
    redirects: { redirects: [], gone: ["a"] },
  });
  assert.equal(errors(bad).length, 1);
});

test("redirects.json sai cấu trúc → lỗi", () => {
  const r = checkLifecycle({
    live: ["a"],
    published: [],
    redirects: { redirects: [{ from: "A B", to: 1 }], gone: [] },
  });
  assert.ok(errors(r).length > 0);
});
