import assert from "node:assert/strict";
import { test } from "node:test";

import { checkRelatedLinks } from "./lib/links.mjs";

const res = (status) => ({
  status,
  ok: status >= 200 && status < 300,
  body: null,
});

test("API trả 404 → lỗi chỉ đúng liên kết đó", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return url.endsWith("/schools/co") ? res(200) : res(404);
  };
  const issues = await checkRelatedLinks(
    [
      { slug: "a", href: "/truong/co" },
      { slug: "a", href: "/truong/khong-co" },
    ],
    { apiBase: "https://api.test", fetchImpl },
  );
  assert.equal(issues.length, 1);
  assert.equal(issues[0].level, "error");
  assert.match(issues[0].message, /\/truong\/khong-co/);
  assert.deepEqual(calls, [
    "https://api.test/api/v1/schools/co",
    "https://api.test/api/v1/schools/khong-co",
  ]);
});

test("/nganh/<truong>/<nganh> gọi đúng endpoint chương trình; /nganh không gọi API", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return res(200);
  };
  const issues = await checkRelatedLinks(
    [
      { slug: "a", href: "/nganh/dh-luat/luat?x=1" },
      { slug: "a", href: "/nganh" },
    ],
    { apiBase: "https://api.test", fetchImpl },
  );
  assert.equal(issues.length, 0);
  assert.deepEqual(calls, [
    "https://api.test/api/v1/schools/dh-luat/majors/luat",
  ]);
});

test("mất mạng → chỉ một cảnh báo, không lỗi", async () => {
  const fetchImpl = async () => {
    throw new Error("offline");
  };
  const issues = await checkRelatedLinks(
    [
      { slug: "a", href: "/truong/x" },
      { slug: "b", href: "/truong/y" },
    ],
    { apiBase: "https://api.test", fetchImpl },
  );
  assert.equal(issues.length, 1);
  assert.equal(issues[0].level, "warn");
});

test("không có apiBase → cảnh báo nếu có liên kết, im lặng nếu không có", async () => {
  assert.equal((await checkRelatedLinks([], { apiBase: null })).length, 0);
  const issues = await checkRelatedLinks([{ slug: "a", href: "/truong/x" }], {
    apiBase: null,
  });
  assert.equal(issues[0].level, "warn");
});
