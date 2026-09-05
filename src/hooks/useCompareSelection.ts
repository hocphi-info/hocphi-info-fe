"use client";

// Tuần 5 (F8): thay Context của CompareTray bằng URL state — "đang chọn gì để
// so sánh" sống ở query key lặp `item=` (đúng quy ước lib/filters.ts, không
// phải CSV), không phải React state. Lý do: state sống ở URL thì tự nhiên
// tồn tại qua điều hướng (so-sanh <-> nganh) và hỗ trợ share-link (F16) mà
// không cần cơ chế riêng.
//
// Dùng được ở CẢ /nganh (đọc + ghi, qua CompareCheckbox/CompareCountButton)
// lẫn /so-sanh (chỉ xoá, qua CompareTable) vì cả 2 đều thao tác trên "item"
// của route hiện tại — không cần Provider bọc cây component nữa.
//
// Giữ nguyên hình dạng API mà CompareContextValue cũ có (selectedIds/
// isSelected/toggle/count/max) để 3 component đang gọi useCompare() chỉ cần
// đổi nguồn state, không đổi cách dùng.

import { useSearchParams } from "next/navigation";
import { toggleMulti, writeParams } from "@/lib/url";
import { COMPARE_KEY, MAX_COMPARE, parseCompareIds } from "@/lib/compare";

export interface CompareSelection {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
  max: number;
}

export function useCompareSelection(): CompareSelection {
  const sp = useSearchParams();
  // parseCompareIds khử trùng + cắt còn tối đa 3 — phòng trường hợp URL bị
  // sửa tay (4+ id, id trùng lặp), không chỉ tin vào việc UI luôn ghi đúng.
  const selectedIds = parseCompareIds(sp);

  function toggle(id: string) {
    const isAdding = !selectedIds.includes(id);
    if (isAdding && selectedIds.length >= MAX_COMPARE) return; // đã đủ 3 -> chặn
    writeParams(
      toggleMulti(new URLSearchParams(sp.toString()), COMPARE_KEY, id),
      "push",
    );
  }

  return {
    selectedIds,
    isSelected: (id) => selectedIds.includes(id),
    toggle,
    count: selectedIds.length,
    max: MAX_COMPARE,
  };
}
