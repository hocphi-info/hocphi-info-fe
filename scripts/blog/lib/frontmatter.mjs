import matter from "gray-matter";

import {
  FRONTMATTER_KEYS,
  LIMITS,
  PILLARS,
  RELATED_HREF,
} from "./constants.mjs";

// Ngày là chuỗi YYYY-MM-DD, không đi qua `Date` khi hiển thị (tránh lệch múi giờ).
// js-yaml tự đổi `2026-10-10` thành Date (UTC 00:00) nên đổi ngược lại ở đây.
export function toDateString(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const check = new Date(Date.UTC(y, mo - 1, d));
  const ok =
    check.getUTCFullYear() === y &&
    check.getUTCMonth() === mo - 1 &&
    check.getUTCDate() === d;
  return ok ? value : null;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isHttpUrl(v) {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Tách front matter + thân bài. Lỗi YAML trả về trong `error`. */
export function parseSource(raw) {
  try {
    const { data, content } = matter(raw);
    return { data, content, error: null };
  } catch (e) {
    return {
      data: {},
      content: "",
      error: `Front matter YAML không đọc được: ${e.message.split("\n")[0]}`,
    };
  }
}

/**
 * Kiểm tra front matter theo schema trong content/bai-viet/README.md.
 * Trả `{ value, issues }`; `value` là null nếu có lỗi nặng làm không dựng được bài.
 * `issues` = [{ level: "error" | "warn", message }].
 */
export function validateFrontmatter(data) {
  const issues = [];
  const err = (message) => issues.push({ level: "error", message });
  const warn = (message) => issues.push({ level: "warn", message });

  for (const key of Object.keys(data)) {
    if (!FRONTMATTER_KEYS.has(key)) {
      warn(`Trường lạ "${key}" (gõ sai tên?). Bỏ qua.`);
    }
  }

  // title
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) err('Thiếu "title".');
  else if (title.length > LIMITS.titleMax)
    err(`"title" dài ${title.length} ký tự, tối đa ${LIMITS.titleMax}.`);
  else if (title.length > LIMITS.titleWarn)
    warn(
      `"title" dài ${title.length} ký tự (> ${LIMITS.titleWarn}): có thể tràn thẻ chia sẻ.`,
    );

  // summary
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  if (!summary) err('Thiếu "summary" (tóm tắt 2–3 câu, hiện đầu bài).');
  else if (summary.length > LIMITS.summaryMax)
    err(`"summary" dài ${summary.length} ký tự, tối đa ${LIMITS.summaryMax}.`);
  else if (summary.length < LIMITS.summaryMin)
    warn(`"summary" chỉ ${summary.length} ký tự: nên 2–3 câu.`);

  // date / updated
  const date = toDateString(data.date);
  if (!date) err('"date" thiếu hoặc không phải ngày hợp lệ YYYY-MM-DD.');
  let updated = null;
  if (data.updated !== undefined && data.updated !== null) {
    updated = toDateString(data.updated);
    if (!updated) err('"updated" không phải ngày hợp lệ YYYY-MM-DD.');
    else if (date && updated < date) err('"updated" sớm hơn "date".');
  }

  // pillar
  if (!PILLARS.includes(data.pillar))
    err(`"pillar" phải là một trong: ${PILLARS.join(", ")}.`);

  // author
  let author = null;
  if (data.author !== undefined && data.author !== null) {
    if (!isNonEmptyString(data.author)) err('"author" phải là chuỗi.');
    else author = data.author.trim();
  }

  // cover (kiểm file ở bước ảnh)
  let cover = null;
  if (data.cover !== undefined && data.cover !== null) {
    if (!isNonEmptyString(data.cover)) err('"cover" phải là đường dẫn ảnh.');
    else cover = data.cover.trim();
  }

  // draft
  if (data.draft !== undefined && typeof data.draft !== "boolean")
    err('"draft" phải là true hoặc false.');
  const draft = data.draft === true;

  // scope (bắt buộc với bài dữ liệu — R7)
  let scope = null;
  if (data.scope !== undefined && data.scope !== null) {
    if (!isNonEmptyString(data.scope)) err('"scope" phải là chuỗi.');
    else scope = data.scope.trim();
  }
  if (data.pillar === "data" && !scope)
    err(
      'Bài nhóm "data" bắt buộc có "scope": nêu số trường/ngành, năm học, độ phủ chưa đầy đủ.',
    );

  // related
  const related = [];
  if (data.related !== undefined && data.related !== null) {
    if (!Array.isArray(data.related)) err('"related" phải là danh sách.');
    else
      data.related.forEach((item, i) => {
        const where = `related[${i}]`;
        if (!item || typeof item !== "object") {
          err(`${where}: cần dạng { label, href }.`);
          return;
        }
        if (!isNonEmptyString(item.label)) err(`${where}: thiếu "label".`);
        if (!isNonEmptyString(item.href) || !RELATED_HREF.test(item.href))
          err(
            `${where}: "href" phải là /truong/<slug>, /nganh/<truong>/<nganh> hoặc /nganh (kèm query tuỳ ý).`,
          );
        if (
          isNonEmptyString(item.label) &&
          isNonEmptyString(item.href) &&
          RELATED_HREF.test(item.href)
        )
          related.push({ label: item.label.trim(), href: item.href });
      });
  }

  // sources (bắt buộc, ≥ 1 — R6)
  const sources = [];
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    err(
      'Thiếu "sources": mỗi bài cần ít nhất 1 nguồn (tên, url, ngày đối chiếu).',
    );
  } else {
    data.sources.forEach((s, i) => {
      const where = `sources[${i}]`;
      if (!s || typeof s !== "object") {
        err(`${where}: cần dạng { name, url, accessed }.`);
        return;
      }
      const accessed = toDateString(s.accessed);
      if (!isNonEmptyString(s.name)) err(`${where}: thiếu "name".`);
      if (!isHttpUrl(s.url)) err(`${where}: "url" phải là http(s) hợp lệ.`);
      if (!accessed)
        err(`${where}: "accessed" phải là ngày YYYY-MM-DD (ngày đối chiếu).`);
      if (isNonEmptyString(s.name) && isHttpUrl(s.url) && accessed)
        sources.push({ name: s.name.trim(), url: s.url, accessed });
    });
  }

  if (issues.some((i) => i.level === "error")) return { value: null, issues };

  return {
    value: {
      title,
      summary,
      date,
      updated,
      pillar: data.pillar,
      author,
      cover,
      draft,
      scope,
      related,
      sources,
    },
    issues,
  };
}
