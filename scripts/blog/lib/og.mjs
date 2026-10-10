// Dựng thẻ chia sẻ Open Graph 1200×630 (og.png) cho bài KHÔNG có ảnh bìa tự làm.
// Satori (HTML/CSS tối giản → SVG) + resvg (SVG → PNG); font TTF nằm ở scripts/blog/fonts
// (Satori không đọc WOFF2). Chạy ở máy bạn/CI lúc build, không chạy trên Worker.
//
// Thiết kế theo mockup artboard 15: gradient theo nhóm, logo + nhãn nhóm, tiêu đề lớn
// (tối đa 3 dòng), lề an toàn ≥ 5%, vòng tròn trang trí góc phải dưới.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(here, "..", "fonts");
const PILLARS = JSON.parse(
  fs.readFileSync(
    path.join(here, "..", "..", "..", "src", "lib", "pillars.json"),
    "utf8",
  ),
);

// Đổi số này khi sửa bố cục để buộc dựng lại ảnh cũ trong bộ nhớ đệm.
const TEMPLATE_VERSION = 1;
const WIDTH = 1200;
const HEIGHT = 630;

const LOGO_WHITE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92">' +
      '<rect x="57" y="47" width="9" height="32" rx="5" transform="rotate(45 61.5 63)" fill="#fff"/>' +
      '<circle cx="36" cy="36" r="29.5" stroke-width="5" fill="none" stroke="#fff"/>' +
      '<rect x="22" y="18" width="28" height="28" rx="3" transform="rotate(45 36 32)" fill="#fff"/>' +
      '<rect x="29" y="54" width="14" height="7" rx="2" fill="#fff"/></svg>',
  );

let fontsCache;
function loadFonts() {
  fontsCache ??= [
    {
      name: "Be Vietnam Pro",
      data: fs.readFileSync(path.join(FONT_DIR, "BeVietnamPro-Bold.ttf")),
      weight: 700,
      style: "normal",
    },
    {
      name: "Be Vietnam Pro",
      data: fs.readFileSync(path.join(FONT_DIR, "BeVietnamPro-Medium.ttf")),
      weight: 500,
      style: "normal",
    },
  ];
  return fontsCache;
}

// Tiêu đề dài thì giảm cỡ chữ để vẫn vừa 3 dòng.
export function titleFontSize(title) {
  if (title.length > 90) return 50;
  if (title.length > 70) return 58;
  return 66;
}

/** Khoá bộ nhớ đệm: đổi tiêu đề/nhóm/phiên bản mẫu → dựng lại; sửa thân bài thì không. */
export function ogCacheKey(post) {
  return crypto
    .createHash("sha1")
    .update(JSON.stringify([TEMPLATE_VERSION, post.title, post.pillar]))
    .digest("hex")
    .slice(0, 16);
}

function element(post) {
  const pillar = PILLARS[post.pillar];
  const white = "#ffffff";
  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `linear-gradient(135deg, ${pillar.from}, ${pillar.to})`,
        color: white,
        fontFamily: "Be Vietnam Pro",
      },
      children: [
        // vòng tròn trang trí (gợi kính lúp của logo)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: -84,
              bottom: -156,
              width: 456,
              height: 456,
              borderRadius: "50%",
              border: "43px solid rgba(255,255,255,0.11)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: 78,
              bottom: -108,
              width: 53,
              height: 180,
              borderRadius: 36,
              backgroundColor: "rgba(255,255,255,0.11)",
              transform: "rotate(-45deg)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              // top/right/bottom/left thay cho width/height: Satori tính padding NGOÀI
              // width/height nên dùng cả hai sẽ đẩy dòng chân trang ra khỏi khung ảnh.
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: "60px 62px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center" },
                  children: [
                    {
                      type: "img",
                      props: { src: LOGO_WHITE, width: 53, height: 53 },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          marginLeft: 17,
                          fontSize: 31,
                          fontWeight: 700,
                        },
                        children: "họcphí.info",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 25,
                          fontWeight: 500,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          opacity: 0.82,
                          marginBottom: 19,
                        },
                        children: pillar.label,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "block",
                          maxWidth: 1010,
                          fontSize: titleFontSize(post.title),
                          fontWeight: 700,
                          lineHeight: 1.2,
                          lineClamp: 3,
                        },
                        children: post.title,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: 25, fontWeight: 500, opacity: 0.78 },
                  children: "hocphi.info/bai-viet",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** Dựng PNG 1200×630 cho một bài. */
export async function renderOgPng(post) {
  const svg = await satori(element(post), {
    width: WIDTH,
    height: HEIGHT,
    fonts: loadFonts(),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
}

/**
 * Sinh public/media/bai-viet/<slug>/og.png cho mọi bài chưa có ảnh bìa tự làm.
 * Dùng bộ nhớ đệm theo hash ở node_modules/.cache/blog-og để build lại nhanh.
 * Không ném lỗi: trả danh sách issue (lỗi dựng ảnh của một bài không làm hỏng bài khác).
 */
export async function generateOgImages({ root, posts }) {
  const issues = [];
  const cacheDir = path.join(root, "node_modules", ".cache", "blog-og");
  fs.mkdirSync(cacheDir, { recursive: true });

  for (const post of posts) {
    if (post.cover) continue; // ảnh bìa tự làm đã là thẻ chia sẻ (build.mjs)
    const target = path.join(
      root,
      "public",
      "media",
      "bai-viet",
      post.slug,
      "og.png",
    );
    const cached = path.join(cacheDir, `${ogCacheKey(post)}.png`);
    try {
      if (!fs.existsSync(cached)) {
        fs.writeFileSync(cached, await renderOgPng(post));
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(cached, target);
    } catch (e) {
      issues.push({
        level: "error",
        slug: post.slug,
        message: `Không dựng được thẻ chia sẻ og.png: ${e.message}`,
      });
    }
  }
  return issues;
}
