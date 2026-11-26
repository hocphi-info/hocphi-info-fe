// Gửi sự kiện tuỳ chỉnh tới Umami từ code (dùng cho input như checkbox, ô tìm kiếm, thanh
// trượt — nơi thuộc tính `data-umami-event` không bắt chắc chắn). Nút và link thì vẫn ưu tiên
// gắn `data-umami-event` thẳng lên thẻ, không cần gọi hàm này.
//
// Không có script Umami (dev, preview, Do Not Track, bị chặn quảng cáo) → `window.umami` không
// tồn tại → hàm im lặng bỏ qua. Không bao giờ ném lỗi ra UI.

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function track(event: string, data?: EventData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // đo lường không được làm hỏng trang
  }
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Chỉ gửi sự kiện sau khi người dùng ngừng thao tác `ms` mili-giây (gõ phím, kéo thanh trượt),
 * để 1 lần tìm "bach khoa" là 1 sự kiện chứ không phải 10. Gọi lại với cùng `event` sẽ huỷ lần
 * hẹn trước.
 */
export function trackDebounced(event: string, data: EventData, ms = 1200) {
  const prev = timers.get(event);
  if (prev) clearTimeout(prev);
  timers.set(
    event,
    setTimeout(() => {
      timers.delete(event);
      track(event, data);
    }, ms),
  );
}
