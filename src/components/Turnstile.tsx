"use client";

// Ô xác minh "không phải robot" của Cloudflare Turnstile (miễn phí, thường tự qua
// không cần bấm). Nạp script của Cloudflare MỘT lần cho cả trang, rồi "render tường
// minh" (explicit) vào <div> qua ref — giống Flutter nhúng PlatformView: React không
// quản nội dung bên trong div, chỉ giữ chỗ.
//
// Token chỉ dùng được MỘT lần: sau mỗi lần gửi, component cha đổi `key` để React
// gỡ widget cũ + tạo widget mới (reset sạch, không phải gọi API reset thủ công).
//
// Chưa cấu hình NEXT_PUBLIC_TURNSTILE_SITE_KEY (dev) → không hiện gì; BE cũng bỏ
// qua bước xác minh khi chưa có secret.

import { useEffect, useRef } from "react";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("no api"));
    s.onerror = () => {
      scriptPromise = null; // lần sau thử nạp lại
      reject(new Error("turnstile script failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function Turnstile({
  onToken,
}: {
  /** Có token mới → chuỗi; hết hạn / lỗi → null. */
  onToken: (token: string | null) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  // Giữ callback mới nhất trong ref: widget chỉ render 1 lần nhưng vẫn gọi đúng hàm
  // của lần render gần nhất của cha.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widgetId: string | null = null;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !boxRef.current) return;
        widgetId = api.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: "vi",
          theme: "auto",
          size: "flexible",
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    // Cleanup = dispose() của Flutter: gỡ widget khi component bị gỡ / đổi key.
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={boxRef} className="min-h-[65px] w-full max-w-[300px]" />;
}
