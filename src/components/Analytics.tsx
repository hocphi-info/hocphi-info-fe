import Script from "next/script";

// Server Component — nạp script đo lượt truy cập (Umami, không cookie) CHỈ KHI có
// NEXT_PUBLIC_UMAMI_ID. Không có biến → không nạp gì (mặc định ở dev và mọi môi trường
// chưa cấu hình). Biến NEXT_PUBLIC_* được "đóng cứng" vào bundle lúc build, nên đặt nó trong
// .env.production trên máy build/deploy (file này không lên git).
//
// - data-domains: chỉ ghi nhận khi đang ở hocphi.info, bỏ localhost/preview.
// - data-do-not-track: tôn trọng cài đặt "Do Not Track" của trình duyệt.
// - UTM (utm_source/medium/campaign) được Umami tự đọc từ URL; KHÔNG bật data-exclude-search.
// - Sự kiện tuỳ chỉnh: thẻ có thuộc tính data-umami-event="tên" (xem ShareButtons,
//   FollowLinks, trang bài) được ghi nhận khi bấm, không cần JS riêng.
const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_ID;
const UMAMI_SRC =
  process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";

export default function Analytics() {
  if (!UMAMI_ID) return null;
  return (
    <Script
      src={UMAMI_SRC}
      data-website-id={UMAMI_ID}
      data-domains="hocphi.info,www.hocphi.info"
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
