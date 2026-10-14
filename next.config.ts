import fs from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

// Chuyển hướng 308 cho slug bài viết đã đổi tên (khai báo ở content/bai-viet/redirects.json,
// do scripts/blog/build.mjs kiểm tra: `to` phải là bài đang đăng, `from` không được là bài
// đang sống). Mục "gone" không cần ở đây — slug đó đơn giản không còn tồn tại nên trả 404.
function postRedirects() {
  const file = path.join(
    process.cwd(),
    "content",
    "bai-viet",
    "redirects.json",
  );
  if (!fs.existsSync(file)) return [];
  const { redirects = [] } = JSON.parse(fs.readFileSync(file, "utf8")) as {
    redirects?: { from: string; to: string }[];
  };
  return redirects.map((r) => ({
    source: `/bai-viet/${r.from}`,
    destination: `/bai-viet/${r.to}`,
    permanent: true,
  }));
}

const nextConfig: NextConfig = {
  async redirects() {
    return postRedirects();
  },
};

export default nextConfig;
