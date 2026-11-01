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

// Header bảo mật cho mọi trang. CSP cố ý chỉ khoá những thứ site không dùng (nhúng
// iframe, <object>, <base>, form gửi ra ngoài) — KHÔNG giới hạn script/style, vì Next
// chèn script inline + Umami nạp từ domain ngoài; muốn siết script phải làm CSP nonce.
// HSTS: trình duyệt bỏ qua header này khi trang tải qua http (dev localhost không bị ảnh hưởng).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return postRedirects();
  },
};

export default nextConfig;
