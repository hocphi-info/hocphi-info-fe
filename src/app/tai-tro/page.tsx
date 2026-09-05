import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Server Component, static. Content from ../mockup/Sponsor.dc.html. The two QR
// images are the donor's real VietQR / MoMo codes (public/qr-*.jpg). Thank-you
// copy is deliberately formal.

export const metadata: Metadata = {
  title: "Tài trợ dự án",
  description:
    "hocphi.info là dự án phi lợi nhuận, miễn phí, không quảng cáo. Ủng hộ qua chuyển khoản VietinBank hoặc ví MoMo để giúp duy trì và mở rộng dữ liệu.",
  alternates: { canonical: "/tai-tro" },
  robots: { index: true, follow: true },
};

const USE_OF_FUNDS = [
  "Duy trì tên miền, máy chủ và sao lưu dữ liệu — để trang luôn hoạt động ổn định, miễn phí.",
  "Mở rộng số trường và số ngành được đối chiếu, ưu tiên các trường người dùng yêu cầu nhiều nhất.",
  "Giữ cho hocphi.info không quảng cáo, không tường phí, không đánh đổi dữ liệu người dùng.",
  "Cải thiện công cụ kiểm tra, đối chiếu và trích dẫn nguồn cho từng con số.",
];

const OTHER_WAYS = [
  {
    title: "Báo số liệu chưa đúng",
    body: "Kèm tên trường – ngành và link tài liệu gốc nếu có.",
  },
  {
    title: "Chia sẻ trang",
    body: "Giới thiệu cho phụ huynh, học sinh lớp 12, thầy cô tư vấn tuyển sinh.",
  },
  {
    title: "Góp nguồn tài liệu",
    body: "Gửi đề án tuyển sinh hoặc quyết định học phí của trường bạn biết.",
  },
  {
    title: "Đóng góp mã nguồn",
    body: "Dự án mở trên GitHub — rất hoan nghênh pull request.",
  },
];

export default function SponsorPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-8">
      {/* Intro */}
      <section className="mx-auto max-w-2xl py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Tài trợ · Đóng góp
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Cảm ơn bạn đã cân nhắc ủng hộ hocphi.info
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
          hocphi.info là một dự án phi lợi nhuận, được duy trì bằng thời gian và
          chi phí cá nhân. Trang web miễn phí hoàn toàn,{" "}
          <strong className="text-ink">không đặt quảng cáo</strong> và{" "}
          <strong className="text-ink">không bán dữ liệu người dùng</strong>.
          Nếu công cụ này hữu ích cho bạn hoặc gia đình trong mùa tuyển sinh,
          một khoản đóng góp — dù nhỏ đến đâu — cũng là nguồn động viên quý giá
          để chúng tôi tiếp tục mở rộng phạm vi trường và giữ cho dữ liệu luôn
          được cập nhật.
        </p>
      </section>

      <div className="rounded-xl border border-border bg-surface-2 p-5 text-sm leading-relaxed text-ink-2">
        Các khoản chi thường xuyên của dự án gồm{" "}
        <strong className="text-ink">tên miền</strong>,{" "}
        <strong className="text-ink">máy chủ &amp; hạ tầng</strong>, và phần lớn
        nhất là{" "}
        <strong className="text-ink">thời gian đối chiếu thủ công</strong> từng
        dòng học phí với đề án tuyển sinh gốc của mỗi trường.
      </div>

      {/* Payment methods */}
      <section className="py-10">
        <h2 className="text-center text-xl font-bold tracking-tight text-ink">
          Hai cách đóng góp
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <PaymentCard
            method="VietinBank"
            badge="VietQR · Napas 247"
            tag="Chuyển khoản"
            qr="/qr-vietinbank.jpg"
            qrWidth={1160}
            qrHeight={1188}
            qrAlt="Mã QR chuyển khoản VietinBank tới tài khoản NGUYEN VAN BIEN, số 108003773344."
            rows={[
              ["Chủ tài khoản", "NGUYEN VAN BIEN"],
              ["Số tài khoản", "108003773344"],
              ["Ngân hàng", "VietinBank – CN Bình Phước – Hội sở"],
              ["Nội dung gợi ý", "Ung ho hocphi.info"],
            ]}
          />
          <PaymentCard
            method="Ví MoMo"
            badge="VietQR · Napas 247"
            tag="Quét bằng app"
            qr="/qr-momo.jpg"
            qrWidth={1109}
            qrHeight={1109}
            qrAlt="Mã QR nhận tiền qua ví MoMo của NGUYEN VAN BIEN."
            rows={[
              ["Chủ tài khoản", "NGUYEN VAN BIEN"],
              ["Cách dùng", "Mở app MoMo › Quét mã › Nhập số tiền"],
              ["Ứng dụng khác", "Mọi app hỗ trợ VietQR đều quét được"],
              ["Lời nhắn gợi ý", "Ung ho hocphi.info"],
            ]}
          />
        </div>
        <p className="mt-4 text-center text-xs text-ink-3">
          Cả hai mã đều theo chuẩn VietQR / Napas 247 — bạn có thể quét bằng ứng
          dụng của bất kỳ ngân hàng hoặc ví điện tử nào.
        </p>
      </section>

      {/* Use of funds */}
      <section className="border-t border-rule py-10">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Đóng góp của bạn được dùng vào đâu
        </h2>
        <p className="mt-1 text-sm text-ink-3">Theo thứ tự ưu tiên:</p>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {USE_OF_FUNDS.map((t) => (
            <li key={t} className="py-2.5 text-sm leading-relaxed text-ink-2">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4 text-sm leading-relaxed text-ink-2">
          <strong className="text-ink">Minh bạch.</strong> Nếu tổng đóng góp đạt
          mức đáng kể, chúng tôi sẽ công khai bảng thu – chi định kỳ trên trang{" "}
          <Link href="/du-lieu" className="text-accent-ink underline">
            Dữ liệu &amp; nguồn
          </Link>
          . hocphi.info hiện là dự án cá nhân, chưa phải tổ chức, nên đóng góp
          không được xuất hoá đơn hay chứng từ khấu trừ thuế.
        </div>
      </section>

      {/* Other ways */}
      <section className="border-t border-rule py-10">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Cách ủng hộ không cần đóng góp tài chính
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OTHER_WAYS.map((w) => (
            <div
              key={w.title}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <h3 className="text-sm font-semibold text-ink">{w.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Formal thanks */}
      <section className="py-10">
        <div className="rounded-xl bg-accent-strong p-8 text-on-accent">
          <h2 className="text-xl font-bold tracking-tight">
            Xin chân thành cảm ơn
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-accent/90">
            Mỗi khoản đóng góp, ở bất kỳ giá trị nào, đều được chúng tôi ghi
            nhận với lòng biết ơn sâu sắc. Sự tin tưởng và ủng hộ của bạn là
            động lực để hocphi.info tiếp tục là một nguồn tra cứu học phí độc
            lập, minh bạch và miễn phí cho cộng đồng. Kính chúc bạn cùng gia
            đình một mùa tuyển sinh nhiều thuận lợi.
          </p>
          <p className="mt-4 text-sm italic text-on-accent/80">
            Trân trọng,
            <br />
            Đội ngũ hocphi.info
          </p>
        </div>
      </section>
    </main>
  );
}

function PaymentCard({
  method,
  badge,
  tag,
  qr,
  qrWidth,
  qrHeight,
  qrAlt,
  rows,
}: {
  method: string;
  badge: string;
  tag: string;
  qr: string;
  qrWidth: number;
  qrHeight: number;
  qrAlt: string;
  rows: [string, string][];
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-accent-strong">{method}</span>
        <span className="rounded-full bg-accent-bg px-2 py-0.5 text-xs font-semibold text-accent-ink">
          {badge}
        </span>
        <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-ink-3">
          {tag}
        </span>
      </div>

      <div className="mx-auto mt-4 w-full max-w-65 overflow-hidden rounded-xl border border-rule">
        {/* unoptimized: a QR must stay pixel-crisp and the source is already
            small — the Image optimizer only adds a lossy re-encode here. */}
        <Image
          src={qr}
          alt={qrAlt}
          width={qrWidth}
          height={qrHeight}
          priority
          unoptimized
          className="h-auto w-full"
        />
      </div>

      <dl className="mt-4 border-t border-rule text-sm">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-4 border-b border-rule py-2"
          >
            <dt className="flex-none text-ink-3">{k}</dt>
            <dd className="text-right font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
