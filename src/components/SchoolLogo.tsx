"use client";

import { useState } from "react";

// Logo trường. Client Component vì cần `onError` (useState cờ lỗi) — khi thiếu
// `logoUrl` HOẶC ảnh tải lỗi thì hiện ô chữ viết tắt thay vì icon "ảnh hỏng".
//
// Logo trường có 3 tỉ lệ: vuông, chữ nhật dọc, chữ nhật ngang. Để cả 3 trông
// gọn:
//   - ô có CHIỀU CAO cố định, chiều rộng co giãn trong khoảng [cao, maxW];
//   - `object-contain` → logo ngang được rộng thêm, logo vuông ra đúng vuông,
//     logo dọc bị giới hạn theo chiều cao (không bao giờ tràn / méo);
//   - nền TRẮNG cố định (kể cả dark mode) vì phần lớn logo là hình nền trong
//     màu đậm — trên nền tối sẽ biến mất nếu không lót trắng.
// Ô fallback (chữ viết tắt) thì luôn VUÔNG và ăn theo token màu của theme.

const SIZES = {
  sm: {
    box: "h-6 min-w-6 max-w-16 rounded p-0.5 text-[0.6rem]",
    sq: "h-6 w-6 rounded text-[0.6rem]",
  },
  md: {
    box: "h-11 min-w-11 max-w-32 rounded-md p-1 text-xs",
    sq: "h-11 w-11 rounded-md text-xs",
  },
} as const;

/** 1–2 chữ cái đầu (bỏ dấu ngoặc / dấu câu) để làm ảnh thay thế. */
function initials(source: string): string {
  const parts = source
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function SchoolLogo({
  logoUrl,
  name,
  shortName,
  size = "sm",
}: {
  logoUrl: string | null;
  name: string;
  shortName?: string | null;
  size?: keyof typeof SIZES;
}) {
  const [errored, setErrored] = useState(false);

  if (!logoUrl || errored) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center border border-border bg-surface-2 font-semibold text-ink-2 ${SIZES[size].sq}`}
      >
        {initials(shortName || name)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-black/10 bg-white ${SIZES[size].box}`}
    >
      {/* Plain <img>, not next/image: logo_url points at arbitrary external
          hosts (Wikimedia, trường sites, …) that would each need an entry in
          next.config.ts `images.remotePatterns`. A small, lazy, unoptimised
          <img> is the right trade-off here — see AGENTS.md "plain, idiomatic". */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
        onError={() => setErrored(true)}
      />
    </span>
  );
}
