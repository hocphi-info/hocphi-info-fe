// Kiểm tra related[].href có trỏ vào trường/ngành CÓ THẬT hay không (plan D21).
// Gọi API công khai; MẤT MẠNG chỉ cảnh báo (không chặn build offline).

function apiPathFor(href) {
  const pathname = href.split("?")[0];
  const school = /^\/truong\/([^/]+)$/.exec(pathname);
  if (school) return `/api/v1/schools/${school[1]}`;
  const program = /^\/nganh\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (program) return `/api/v1/schools/${program[1]}/majors/${program[2]}`;
  return null; // "/nganh" (danh sách) luôn tồn tại
}

export async function checkRelatedLinks(
  entries, // [{ slug, href }]
  { apiBase, fetchImpl = fetch, timeoutMs = 5000 },
) {
  const issues = [];
  if (!apiBase) {
    if (entries.length > 0) {
      issues.push({
        level: "warn",
        message:
          "Không có NEXT_PUBLIC_API_URL nên bỏ qua bước kiểm tra liên kết related.",
      });
    }
    return issues;
  }

  const seen = new Map(); // href → "ok" | "missing" | "unknown"
  let offlineReported = false;

  for (const { slug, href } of entries) {
    const apiPath = apiPathFor(href);
    if (!apiPath) continue;

    if (!seen.has(href)) {
      let status = "unknown";
      try {
        const res = await fetchImpl(`${apiBase}${apiPath}`, {
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (res.status === 404) status = "missing";
        else if (res.ok) status = "ok";
        await res.body?.cancel?.();
      } catch {
        status = "unknown";
      }
      seen.set(href, status);
    }

    const status = seen.get(href);
    if (status === "missing") {
      issues.push({
        level: "error",
        message: `[${slug}] related trỏ tới ${href} nhưng API trả 404 (trường/ngành không tồn tại hoặc chưa có dữ liệu).`,
      });
    } else if (status === "unknown" && !offlineReported) {
      offlineReported = true;
      issues.push({
        level: "warn",
        message: `Không gọi được API (${apiBase}) nên chưa kiểm tra được liên kết related. Kiểm tra lại khi có mạng.`,
      });
    }
  }
  return issues;
}
