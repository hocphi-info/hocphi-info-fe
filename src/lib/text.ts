// Bỏ dấu tiếng Việt + lowercase — cho ô "Tìm nhanh" (F13) lọc bảng không phân
// biệt dấu. Cùng thuật toán với backend `app/text.py` (thứ tự: lowercase → NFD
// tách dấu → xoá ký tự dấu (Unicode "Mark, Nonspacing") → đ→d → trim), nên FE
// (lọc client) và BE (`?search=`) khớp kết quả.
//
// Hàm thuần, không import React — dùng được cả ở lib/filters.ts (chạy trên
// server lúc SSR lẫn client mỗi lần gõ).

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/đ/g, "d")
    .trim();
}

// Số ký tự tối thiểu của từ khoá để khớp TIỀN TỐ alias (ngắn hơn chỉ khớp khi BẰNG).
const MIN_ALIAS_PREFIX_LEN = 3;

/**
 * Tên gọi khác của ngành ("cntt", "it", "computer science") — `query` và `alias`
 * đã qua `normalize()`. Khớp khi BẰNG nhau, hoặc `alias` bắt đầu bằng `query`
 * (query ≥ 3 ký tự). KHÔNG khớp chuỗi con: "it" nằm trong "digital" nhưng không
 * được ra ngành nào chỉ vì alias "it" của Công nghệ thông tin.
 *
 * PHẢI giữ cùng quy tắc với backend `app/text.py::alias_matches` để lọc client
 * và `?search=` của API cho cùng kết quả.
 */
export function aliasMatches(query: string, alias: string): boolean {
  if (query === alias) return true;
  return query.length >= MIN_ALIAS_PREFIX_LEN && alias.startsWith(query);
}
