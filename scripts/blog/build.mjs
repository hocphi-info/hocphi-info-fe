#!/usr/bin/env node
// Đường ống bài viết: content/bai-viet/<slug>/ → src/generated/posts.json + ảnh.
//
// Vì sao sinh một file JSON thay vì để trang đọc thẳng file .md?
//   Trên Cloudflare Workers không có đĩa lúc chạy (plan D1): trang phải lấy nội
//   dung từ thứ đã nằm sẵn trong bundle. Script này chạy ở máy bạn/CI lúc build,
//   kiểm tra mọi thứ, render Markdown → HTML, rồi ghi ra một module để import.
//
// Cờ:
//   --check-only   chỉ kiểm tra, không ghi gì (make blog-check)
//   --drafts       đưa bài nháp vào JSON (chỉ dùng cho dev, plan D2)
//   --no-og        bỏ bước dựng og.png (nhanh hơn; dùng cho typecheck/dev)
//   --no-links     bỏ kiểm tra related[].href qua API
//   --root=<dir>   gốc dự án (mặc định: thư mục chứa scripts/)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { LIMITS, MEDIA_PREFIX } from "./lib/constants.mjs";
import { parseSource, validateFrontmatter } from "./lib/frontmatter.mjs";
import { coverRatioWarning, createImageResolver } from "./lib/images.mjs";
import { checkLifecycle } from "./lib/lifecycle.mjs";
import { checkRelatedLinks } from "./lib/links.mjs";
import { generateOgImages } from "./lib/og.mjs";
import { pickRelated } from "./lib/related.mjs";
import { renderMarkdown } from "./lib/render.mjs";
import { isValidSlug } from "./lib/slug.mjs";

const DEFAULT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readApiBase(root) {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  const envFile = path.join(root, ".env.production");
  if (!fs.existsSync(envFile)) return null;
  const m = /^NEXT_PUBLIC_API_URL=(.+)$/m.exec(
    fs.readFileSync(envFile, "utf8"),
  );
  return m
    ? m[1]
        .trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\/$/, "")
    : null;
}

function listPostDirs(contentDir) {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."),
    )
    .map((d) => d.name)
    .sort();
}

/**
 * Chạy toàn bộ đường ống. Trả `{ posts, issues, stats }`; không in gì, không thoát
 * tiến trình (CLI bên dưới lo việc đó) nên test và dev.mjs gọi lại được.
 * `issues` = [{ level, slug?, message }].
 */
export async function runBuild({
  root = DEFAULT_ROOT,
  drafts = false,
  checkOnly = false,
  links = true,
  og = true,
} = {}) {
  const contentDir = path.join(root, "content", "bai-viet");
  const issues = [];
  const add = (level, slug, message) => issues.push({ level, slug, message });

  const dirNames = listPostDirs(contentDir);
  const results = []; // mọi bài đọc được (kể cả nháp)
  const liveSlugs = [];

  for (const slug of dirNames) {
    const dir = path.join(contentDir, slug);
    const file = path.join(dir, "index.md");

    if (!isValidSlug(slug)) {
      add(
        "error",
        slug,
        `Tên thư mục "${slug}" không hợp lệ: chỉ chữ thường không dấu, số và gạch nối (vd. hoc-phi-nganh-luat).`,
      );
      liveSlugs.push(slug);
      continue;
    }
    if (!fs.existsSync(file)) {
      add("error", slug, "Thiếu index.md trong thư mục bài.");
      liveSlugs.push(slug);
      continue;
    }

    const { data, content, error } = parseSource(fs.readFileSync(file, "utf8"));
    const isDraft = !error && data.draft === true;
    if (!isDraft) liveSlugs.push(slug);

    // Bài nháp đang viết dở không được chặn build/deploy: lỗi hạ thành cảnh báo.
    const post = [];
    const report = (level, message) =>
      post.push({
        level: isDraft && level === "error" ? "warn" : level,
        message: isDraft && level === "error" ? `[nháp] ${message}` : message,
      });

    if (error) {
      report("error", error);
      post.forEach((i) => add(i.level, slug, i.message));
      continue;
    }

    const fm = validateFrontmatter(data);
    fm.issues.forEach((i) => report(i.level, i.message));

    const resolveImage = createImageResolver({ dir, slug });
    const rendered = renderMarkdown(content, { resolveImage });
    rendered.issues.forEach((i) => report(i.level, i.message));

    let cover = null;
    if (fm.value?.cover) {
      const res = resolveImage(fm.value.cover);
      if (res.ok) {
        cover = {
          url: res.url,
          rel: res.rel,
          width: res.width,
          height: res.height,
        };
        for (const w of res.warnings) report("warn", w);
        const ratio = coverRatioWarning(res.width, res.height);
        if (ratio) report("warn", ratio);
      } else {
        report("error", `cover: ${res.error}`);
      }
    }

    if (content.trim().length === 0) report("error", "Thân bài trống.");

    post.forEach((i) => add(i.level, slug, i.message));

    const failed = post.some((i) => i.level === "error") || !fm.value;
    if (failed) continue;

    results.push({
      draft: isDraft,
      mediaFiles: [
        ...new Set([...rendered.images, ...(cover ? [cover.rel] : [])]),
      ],
      post: {
        slug,
        title: fm.value.title,
        summary: fm.value.summary,
        date: fm.value.date,
        updated: fm.value.updated,
        pillar: fm.value.pillar,
        author: fm.value.author,
        cover: cover && {
          url: cover.url,
          width: cover.width,
          height: cover.height,
        },
        // Có ảnh bìa tự làm thì dùng luôn nó làm thẻ chia sẻ; không thì og.png tự sinh.
        ogImage: cover ? cover.url : `${MEDIA_PREFIX}/${slug}/og.png`,
        scope: fm.value.scope,
        related: fm.value.related,
        sources: fm.value.sources,
        readingMinutes: rendered.readingMinutes,
        headings: rendered.headings,
        html: rendered.html,
        draft: isDraft,
      },
    });
  }

  // Cảnh báo ảnh nằm trong thư mục bài mà không bài nào dùng.
  for (const slug of dirNames) {
    const r = results.find((x) => x.post.slug === slug);
    if (!r) continue;
    const dir = path.join(contentDir, slug);
    const used = new Set(r.mediaFiles);
    for (const f of fs.readdirSync(dir)) {
      if (f === "index.md" || f.startsWith(".")) continue;
      if (!used.has(f) && /\.(png|jpe?g|webp)$/i.test(f)) {
        add(
          "warn",
          slug,
          `Ảnh "${f}" không được bài dùng (bỏ qua, không đưa lên site).`,
        );
      }
    }
  }

  // Vòng đời slug (R21): URL đã đăng không được tự chết.
  const published = readJson(path.join(contentDir, "published.json"), []);
  const redirects = readJson(path.join(contentDir, "redirects.json"), {
    redirects: [],
    gone: [],
  });
  for (const i of checkLifecycle({ live: liveSlugs, published, redirects })) {
    add(i.level, undefined, i.message);
  }

  const included = results
    .filter((r) => drafts || !r.draft)
    .sort((a, b) =>
      a.post.date === b.post.date
        ? a.post.slug.localeCompare(b.post.slug)
        : a.post.date < b.post.date
          ? 1
          : -1,
    );
  const posts = included.map((r) => r.post);
  for (const p of posts) p.relatedSlugs = pickRelated(posts, p.slug);

  if (links) {
    const entries = posts.flatMap((p) =>
      p.draft ? [] : p.related.map((r) => ({ slug: p.slug, href: r.href })),
    );
    const linkIssues = await checkRelatedLinks(entries, {
      apiBase: readApiBase(root),
    });
    for (const i of linkIssues) add(i.level, undefined, i.message);
  }

  const json = JSON.stringify(posts);
  const jsonBytes = Buffer.byteLength(json);
  const gzipBytes = zlib.gzipSync(json).length;
  if (gzipBytes > LIMITS.jsonGzipWarnBytes) {
    add(
      "warn",
      undefined,
      `posts.json nén còn ${Math.round(gzipBytes / 1024)} KB (> ${LIMITS.jsonGzipWarnBytes / 1024} KB): sắp chạm hạn mức bundle Worker gói Free (3 MB sau nén; hiện đã ~1,1 MB).`,
    );
  }

  const stats = {
    live: results.filter((r) => !r.draft).length,
    drafts: results.filter((r) => r.draft).length,
    included: posts.length,
    jsonBytes,
    gzipBytes,
  };

  const hasError = issues.some((i) => i.level === "error");
  if (!checkOnly && !hasError) {
    const outDir = path.join(root, "src", "generated");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "posts.json"), json);
    syncMedia({ root, contentDir, included });
    if (og) {
      const ogIssues = await generateOgImages({ root, posts });
      for (const i of ogIssues) add(i.level, i.slug, i.message);
    }
  }

  return { posts, issues, stats };
}

// Chép ảnh được dùng sang public/media/bai-viet/<slug>/ (xoá thư mục cũ trước để
// không còn ảnh mồ côi; xoá luôn thư mục của slug không còn trong bản build này).
function syncMedia({ root, contentDir, included }) {
  const mediaRoot = path.join(root, "public", "media", "bai-viet");
  fs.mkdirSync(mediaRoot, { recursive: true });
  const keep = new Set(included.map((r) => r.post.slug));
  for (const name of fs.readdirSync(mediaRoot)) {
    if (!keep.has(name))
      fs.rmSync(path.join(mediaRoot, name), { recursive: true, force: true });
  }
  for (const { post, mediaFiles } of included) {
    const target = path.join(mediaRoot, post.slug);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
    for (const rel of mediaFiles) {
      const dest = path.join(target, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(contentDir, post.slug, rel), dest);
    }
  }
}

export function formatIssues(issues) {
  return issues
    .map((i) => {
      const icon = i.level === "error" ? "✖" : "⚠";
      const where = i.slug ? `[${i.slug}] ` : "";
      return `${icon} ${where}${i.message}`;
    })
    .join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (name) => args.includes(`--${name}`);
  const rootArg = args.find((a) => a.startsWith("--root="));
  const { posts, issues, stats } = await runBuild({
    root: rootArg
      ? path.resolve(rootArg.slice("--root=".length))
      : DEFAULT_ROOT,
    drafts: flag("drafts"),
    checkOnly: flag("check-only"),
    links: !flag("no-links"),
    og: !flag("no-og"),
  });

  if (issues.length > 0) console.log(formatIssues(issues));
  const errors = issues.filter((i) => i.level === "error").length;
  const warns = issues.length - errors;
  console.log(
    `\nBài viết: ${stats.live} đăng, ${stats.drafts} nháp${flag("drafts") ? " (có trong bản dev)" : " (bỏ qua)"} · ` +
      `posts.json ${Math.round(stats.jsonBytes / 1024)} KB (nén ${Math.round(stats.gzipBytes / 1024)} KB) · ` +
      `${errors} lỗi, ${warns} cảnh báo`,
  );
  if (errors > 0) process.exit(1);
  void posts;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
