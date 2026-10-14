import { getAllPosts, pillarLabel, postAuthor, postUrl } from "@/lib/posts";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// Route Handler → /bai-viet/feed.xml (RSS 2.0). Chỉ để tóm tắt + link về bài: mục tiêu
// là kéo người đọc về site, nên không đưa toàn văn vào feed.
// `force-static`: nội dung chỉ đổi khi build lại (đọc từ posts.json), không cần chạy mỗi request.
export const dynamic = "force-static";

const TITLE = `Bài viết · ${SITE_NAME}`;
const DESCRIPTION =
  "Phân tích từ cơ sở dữ liệu hocphi.info, những câu hỏi chưa báo nào trả lời, và tin giáo dục nhìn qua góc học phí.";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "2026-10-10" → ngày 00:00 giờ Việt Nam, đổi sang định dạng RFC 822 mà RSS yêu cầu.
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00+07:00`).toUTCString();
}

export function GET() {
  const posts = getAllPosts();
  const newest = posts[0];

  const items = posts
    .map(
      (post) => `    <item>
      <title>${esc(post.title)}</title>
      <link>${esc(postUrl(post.slug))}</link>
      <guid isPermaLink="true">${esc(postUrl(post.slug))}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <dc:creator>${esc(postAuthor(post).name)}</dc:creator>
      <category>${esc(pillarLabel(post.pillar))}</category>
      <description>${esc(post.summary)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${esc(absoluteUrl("/bai-viet"))}</link>
    <description>${esc(DESCRIPTION)}</description>
    <language>vi-VN</language>
    <atom:link href="${esc(absoluteUrl("/bai-viet/feed.xml"))}" rel="self" type="application/rss+xml" />${
      newest
        ? `
    <lastBuildDate>${rfc822(newest.updated ?? newest.date)}</lastBuildDate>`
        : ""
    }
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
