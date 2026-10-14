import MarkdownIt from "markdown-it";

import { LIMITS } from "./constants.mjs";
import { slugify } from "./slug.mjs";

// Duyệt cây token (inline có `children`).
function walk(tokens, fn) {
  for (const t of tokens) {
    fn(t);
    if (t.children) walk(t.children, fn);
  }
}

function inlineText(inlineToken) {
  return (inlineToken.children ?? [])
    .filter((c) => c.type === "text" || c.type === "code_inline")
    .map((c) => c.content)
    .join("")
    .trim();
}

/**
 * Markdown → HTML, kèm kiểm tra theo plan (D4):
 *  - HTML thô bị cấm (lỗi) và vẫn được thoát ký tự nếu lọt tới bước render;
 *  - ảnh: bắt buộc alt, đường dẫn tương đối được viết lại, gắn width/height/lazy;
 *  - bảng: bọc div cuộn ngang có role/tabindex, `<th scope="col">`;
 *  - h2: gắn id không dấu (mục lục); h1 bị cấm; nhảy cấp (h2 → h4) là cảnh báo;
 *  - liên kết ngoài: rel="noopener noreferrer".
 *
 * `resolveImage(src)` do bên gọi cấp (xem images.mjs) nên test không cần đĩa.
 * Trả `{ html, headings, wordCount, readingMinutes, images, issues }`.
 */
export function renderMarkdown(source, { resolveImage }) {
  const issues = [];
  const headings = [];
  const images = [];
  let wordCount = 0;

  const md = new MarkdownIt({
    html: true, // chỉ để PHÁT HIỆN html; mọi token html đều báo lỗi + bị thoát ký tự
    linkify: true,
    typographer: false,
  });

  const escapeToken = (tokens, idx) => md.utils.escapeHtml(tokens[idx].content);
  md.renderer.rules.html_block = escapeToken;
  md.renderer.rules.html_inline = escapeToken;

  md.renderer.rules.table_open = (tokens, idx, options, _env, self) =>
    '<div class="table-scroll" role="region" tabindex="0" aria-label="Bảng dữ liệu">' +
    self.renderToken(tokens, idx, options);
  md.renderer.rules.table_close = (tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options) + "</div>\n";

  md.core.ruler.push("blog_checks", (state) => {
    const usedIds = new Set();
    let lastLevel = 1;

    state.tokens.forEach((token, i) => {
      if (token.type === "heading_open") {
        const level = Number(token.tag.slice(1));
        const text = inlineText(state.tokens[i + 1]);
        if (level === 1) {
          issues.push({
            level: "error",
            message: `Không dùng "# ${text}" (h1) trong thân bài: tiêu đề trang đã là h1. Dùng ## cho mục.`,
          });
        } else if (level > lastLevel + 1) {
          issues.push({
            level: "warn",
            message: `Mục "${text}" nhảy cấp heading (h${lastLevel} → h${level}).`,
          });
        }
        if (level === 2) {
          const base = slugify(text) || `muc-${headings.length + 1}`;
          let id = base;
          for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
          usedIds.add(id);
          token.attrSet("id", id);
          headings.push({ id, text });
        }
        lastLevel = level;
      }

      if (token.type === "th_open") token.attrSet("scope", "col");

      if (token.type === "inline") {
        wordCount += token.content.split(/\s+/).filter(Boolean).length;
      }
    });

    walk(state.tokens, (t) => {
      if (t.type === "html_block" || t.type === "html_inline") {
        issues.push({
          level: "error",
          message: `HTML thô không được hỗ trợ trong bài: "${t.content.trim().slice(0, 60)}".`,
        });
      }

      if (t.type === "link_open") {
        const href = t.attrGet("href") ?? "";
        if (/^https?:\/\//i.test(href)) t.attrSet("rel", "noopener noreferrer");
      }

      if (t.type === "image") {
        const src = t.attrGet("src") ?? "";
        const alt = t.content.trim();
        if (!alt) {
          issues.push({
            level: "error",
            message: `Ảnh "${src}" thiếu mô tả thay thế (alt): viết ![mô tả](${src}).`,
          });
        }
        const res = resolveImage(src);
        if (res.ok) {
          t.attrSet("src", res.url);
          t.attrSet("width", String(res.width));
          t.attrSet("height", String(res.height));
          t.attrSet("loading", "lazy");
          t.attrSet("decoding", "async");
          images.push(res.rel);
          for (const w of res.warnings)
            issues.push({ level: "warn", message: w });
        } else if (res.external) {
          issues.push({ level: "warn", message: res.error });
        } else {
          issues.push({ level: "error", message: res.error });
        }
      }
    });
  });

  const html = md.render(source);

  return {
    html,
    headings,
    wordCount,
    readingMinutes: Math.max(1, Math.ceil(wordCount / LIMITS.wordsPerMinute)),
    images,
    issues,
  };
}
