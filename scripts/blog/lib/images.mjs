import fs from "node:fs";
import path from "node:path";

import { imageSize } from "image-size";

import { IMAGE_EXTS, LIMITS, MEDIA_PREFIX } from "./constants.mjs";

function isExternal(src) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src) || src.startsWith("/");
}

/**
 * Tạo hàm `resolve(src)` cho một bài: đường dẫn ảnh tương đối trong thư mục bài →
 * URL phục vụ + kích thước. Không ném lỗi; trả `{ ok: false, error }` hoặc
 * `{ ok: true, url, rel, width, height, bytes, warnings }`.
 *
 * `readFile`/`exists` tiêm được để test không cần đĩa thật.
 */
export function createImageResolver({
  dir,
  slug,
  readFile = fs.readFileSync,
  exists = fs.existsSync,
}) {
  return function resolve(src) {
    if (isExternal(src)) {
      return {
        ok: false,
        external: true,
        error: `Ảnh "${src}" là đường dẫn tuyệt đối/ngoài site: nên để ảnh cạnh bài (đường dẫn tương đối).`,
      };
    }
    const rel = path.posix.normalize(src.replace(/\\/g, "/"));
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return { ok: false, error: `Ảnh "${src}" trỏ ra ngoài thư mục bài.` };
    }
    const ext = path.extname(rel).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) {
      return {
        ok: false,
        error: `Ảnh "${src}": định dạng ${ext || "(không có)"} không được hỗ trợ (png, jpg, webp).`,
      };
    }
    const file = path.join(dir, rel);
    if (!exists(file)) {
      return {
        ok: false,
        error: `Không tìm thấy ảnh "${src}" trong thư mục bài.`,
      };
    }
    let buf;
    try {
      buf = readFile(file);
    } catch (e) {
      return { ok: false, error: `Không đọc được ảnh "${src}": ${e.message}` };
    }
    const bytes = buf.length;
    if (bytes > LIMITS.imageMaxBytes) {
      return {
        ok: false,
        error: `Ảnh "${src}" nặng ${Math.round(bytes / 1024)} KB (tối đa ${LIMITS.imageMaxBytes / 1024} KB). Nén hoặc xuất WebP.`,
      };
    }
    let width;
    let height;
    try {
      ({ width, height } = imageSize(buf));
    } catch {
      return {
        ok: false,
        error: `Ảnh "${src}" không đọc được kích thước (file hỏng?).`,
      };
    }
    if (!width || !height) {
      return { ok: false, error: `Ảnh "${src}" không có kích thước hợp lệ.` };
    }
    const warnings = [];
    if (bytes > LIMITS.imageWarnBytes) {
      warnings.push(
        `Ảnh "${src}" nặng ${Math.round(bytes / 1024)} KB (> ${LIMITS.imageWarnBytes / 1024} KB): nên nén bớt.`,
      );
    }
    return {
      ok: true,
      rel,
      url: `${MEDIA_PREFIX}/${slug}/${rel}`,
      width,
      height,
      bytes,
      warnings,
    };
  };
}

/** Ảnh bìa tự làm nên tỉ lệ 1,91:1 (thẻ chia sẻ 1200×630). Trả cảnh báo hoặc null. */
export function coverRatioWarning(width, height) {
  const ratio = width / height;
  const diff = Math.abs(ratio - LIMITS.coverRatio) / LIMITS.coverRatio;
  if (diff > LIMITS.coverRatioTolerance) {
    return `Ảnh bìa ${width}×${height} lệch tỉ lệ 1,91:1 (khuyến nghị 1200×630): có thể bị cắt khi chia sẻ.`;
  }
  return null;
}
