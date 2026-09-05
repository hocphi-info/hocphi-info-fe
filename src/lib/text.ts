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
