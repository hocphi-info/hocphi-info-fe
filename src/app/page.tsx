import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

// Server Component, fully static — no data fetching, no "use client". Structure
// mirrors ../mockup/Landing.dc.html (hero → problem → 3 USPs → 3 feature rows →
// data/method band → dark-mode teaser → FAQ → CTA). Rendered with the app's own
// design tokens (bg-surface / text-ink / bg-accent …) rather than the mockup's
// Lora/Be-Vietnam-Pro type, so it matches /nganh, /truong and /so-sanh.

export const metadata: Metadata = {
  title: "Học phí đại học, tính đủ cho cả khoá",
  description: SITE_TAGLINE,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — Học phí đại học, tính đủ cho cả khoá`,
    description: SITE_TAGLINE,
    url: SITE_URL,
  },
};

// Single source of truth for the FAQ: the section below AND the FAQPage JSON-LD
// are built from this array.
const FAQ = [
  {
    q: "Dữ liệu học phí lấy từ đâu?",
    a: "Từ đề án tuyển sinh và thông báo học phí chính thức của từng trường (thường là file PDF), không lấy từ bài báo tổng hợp. Mỗi con số trên trang chi tiết đều có link về tài liệu gốc và ngày đối chiếu.",
  },
  {
    q: "Vì sao dùng trung vị theo hệ đào tạo, không dùng trung bình?",
    a: "Học phí hệ chất lượng cao, tiên tiến hoặc quốc tế có thể gấp 3–5 lần hệ đại trà. Gộp chung rồi lấy trung bình sẽ ra một con số không đại diện cho ngành nào. hocphi.info tách riêng từng hệ trước, rồi mới tính trung vị cho mỗi hệ.",
  },
  {
    q: "Tổng học phí cả khoá được ước lượng thế nào?",
    a: "Năm đầu lấy đúng số trường công bố cho khoá nhập học 2026. Các năm sau nhân luỹ tiến theo % tăng: ưu tiên lộ trình trường công bố trong đề án tuyển sinh; nếu không có thì dùng mức mặc định và ghi rõ “ước lượng”. Con số này chưa gồm sinh hoạt phí, giáo trình hay chi phí lấy chứng chỉ hành nghề.",
  },
  {
    q: "Hiện có bao nhiêu trường, khi nào có thêm?",
    a: "Giai đoạn pilot tập trung 50 trường ở TP.HCM và Hà Nội, chọn cả trường công top đầu, trường công tự chủ tài chính và trường tư để dữ liệu đủ độ trải cho việc tính trung vị. Danh sách mở rộng sau khi có phản hồi từ người dùng thật.",
  },
  {
    q: "Số liệu trên hocphi.info có phải tư vấn tài chính không?",
    a: "Không. Đây là dữ liệu tham khảo để lập kế hoạch, không phải cam kết của nhà trường và không phải tư vấn tài chính. Học phí thực tế do trường quyết định và có thể thay đổi.",
  },
  {
    q: "Tôi thấy một con số chưa đúng thì báo ở đâu?",
    a: "Gửi phản hồi qua email hoặc GitHub issue của dự án. Mỗi báo lỗi được đối chiếu lại với tài liệu gốc trước khi cập nhật.",
  },
];

const USPS = [
  {
    title: "Trung vị, tách theo hệ",
    body: "Học phí hệ chất lượng cao / tiên tiến / quốc tế có thể gấp 3–5 lần hệ đại trà. Mỗi hệ được tính trung vị riêng thay vì gộp chung rồi lấy trung bình.",
  },
  {
    title: "Tổng chi phí cả khoá",
    body: "Ước lượng học phí 4–5 năm dựa trên % tăng thật nếu trường công bố lộ trình; chỉ dùng mức mặc định khi trường không công bố, và ghi rõ “ước lượng”.",
  },
  {
    title: "Chi tiết tới từng ngành",
    body: "Không dừng ở “học phí trường X”. Xem đúng ngành bạn quan tâm, ở đúng hệ đào tạo, kèm nguồn trích dẫn cho từng con số.",
  },
];

const FEATURES = [
  {
    eyebrow: "Tra cứu",
    title:
      "Theo ngành để chọn trường — hoặc theo trường để thấy khoảng học phí",
    body: "Cùng một trường, ngành rẻ nhất và ngành đắt nhất có thể chênh nhau 3–5 lần. Trang “theo trường” hiển thị khoảng Min – Max thay vì một con số trung bình vô nghĩa.",
    points: [
      "Biểu đồ khoảng thấp nhất – cao nhất + trung vị hệ đại trà của từng trường",
      "Bộ lọc theo thành phố, nhóm ngành, hệ đào tạo, loại trường",
      "Hệ CLC / quốc tế / liên kết tách riêng, không kéo lệch trung vị",
      "Sắp xếp theo học phí năm đầu, tổng cả khoá hoặc tốc độ tăng",
    ],
    img: "/screenshots/search-by-school.png",
    alt: "Tra cứu học phí theo trường: biểu đồ khoảng Min–Max hệ đại trà và bảng thấp nhất / trung vị / cao nhất cho từng trường.",
    url: "hocphi.info/truong",
    href: "/truong",
    reverse: false,
  },
  {
    eyebrow: "Trang chi tiết ngành – trường",
    title: "Mọi con số đều truy ngược được về đề án tuyển sinh gốc",
    body: "Trang chi tiết gộp học phí từng năm × từng hệ, biểu đồ xu hướng, và những khoản chi phí “ẩn” mà đề án tuyển sinh thường không nhắc tới.",
    points: [
      "Biểu đồ đã công bố vs dự phóng theo lộ trình tăng từng trường",
      "Bảng học phí từng năm học × hệ đào tạo, mỗi dòng kèm link nguồn",
      "Chi phí sau tốt nghiệp để hành nghề (Luật, Y – Dược, Kiểm toán, Kiến trúc…)",
      "Trạng thái dữ liệu: đã xác minh / chưa xác minh / ước lượng",
    ],
    img: "/screenshots/major-detail.png",
    alt: "Trang chi tiết ngành Luật – ĐH Luật TP.HCM: học phí năm đầu, trung vị cả khoá, tổng 4 năm, biểu đồ xu hướng và chi phí sau tốt nghiệp.",
    url: "hocphi.info/nganh/dh-luat-tphcm/luat",
    href: "/nganh",
    reverse: true,
  },
  {
    eyebrow: "So sánh",
    title: "Đặt 2–4 lựa chọn cạnh nhau, tính chênh lệch cho cả khoá",
    body: "Chọn ngành – trường – hệ bất kỳ từ trang tra cứu, đưa vào bảng so sánh để thấy khác biệt thật nằm ở đâu.",
    points: [
      "Biểu đồ cột nhóm theo từng năm học của khoá 2026",
      "Bảng đối chiếu: năm đầu, trung vị, tổng 4 năm, tốc độ tăng, chênh so với rẻ nhất",
      "Diễn giải rõ: chênh lệch đến từ loại hình trường hay chất lượng đào tạo",
      "Mỗi cột ghi nguồn và ngày cập nhật riêng",
    ],
    img: "/screenshots/compare.png",
    alt: "Trang so sánh học phí ngành Công nghệ thông tin giữa ĐH Bách khoa TP.HCM, UIT và ĐH FPT: biểu đồ cột theo năm và bảng đối chiếu tổng 4 năm.",
    url: "hocphi.info/so-sanh",
    href: "/so-sanh",
    reverse: false,
  },
];

export default function Home() {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/hocphi-icon.svg"),
    description: SITE_TAGLINE,
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/nganh?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="flex-1">
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Dự án dữ liệu mở · Mùa tuyển sinh 2026
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Học phí đại học, tính đủ cho cả khoá
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-ink-2 sm:text-lg">
          Tra cứu &amp; so sánh học phí{" "}
          <strong className="text-ink">theo từng ngành – trường</strong>, trung
          vị tách riêng theo hệ đào tạo, kèm ước lượng{" "}
          <strong className="text-ink">tổng chi phí cả khoá 4–5 năm</strong>{" "}
          theo lộ trình tăng của từng trường.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/nganh"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-strong"
          >
            Tra cứu theo ngành
          </Link>
          <Link
            href="/truong"
            className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink hover:border-accent-border"
          >
            Tra cứu theo trường
          </Link>
        </div>
        <p className="mt-5 text-xs text-ink-3">
          <strong className="text-ink-2">50 trường pilot</strong> TP.HCM &amp;
          Hà Nội · 6 nhóm ngành hot 2026 · nguồn: đề án tuyển sinh, đối chiếu
          tay
        </p>

        <BrowserFrame
          url="hocphi.info/nganh/cong-nghe-thong-tin"
          className="mt-12"
        >
          <FrameShot
            src="/screenshots/search-by-major.png"
            alt="Bảng tra cứu học phí ngành Công nghệ thông tin: danh sách trường, học phí năm đầu, tổng 4 năm ước lượng và tốc độ tăng mỗi năm."
            heightClass="h-[420px] sm:h-[560px]"
            priority
          />
        </BrowserFrame>
      </section>

      {/* Problem */}
      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight text-ink">
            Con số phụ huynh thật sự cần thì chưa ai đưa ra tử tế
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            Việt Nam chưa có nguồn dữ liệu chuẩn hoá kiểu IPEDS (Mỹ). Mỗi trường
            công bố học phí riêng lẻ trong đề án tuyển sinh dạng PDF — và đây là
            ba khoảng trống lớn nhất:
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                head: "“10 – 50 tr/năm”",
                body: "Báo chí chỉ đưa mức chung chung “tuỳ ngành”. Không tra được ngành cụ thể ở trường cụ thể là bao nhiêu.",
              },
              {
                head: "đồng/tháng · đồng/tín chỉ",
                body: "Đơn vị tính mỗi trường một kiểu, không quy về cùng một mốc để đặt cạnh nhau được.",
              },
              {
                head: "? tr cho cả khoá",
                body: "Không ai cộng dồn 4–5 năm kèm lộ trình tăng học phí — dù đây mới là con số để lập kế hoạch tài chính.",
              },
            ].map((c) => (
              <div
                key={c.head}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="font-semibold text-accent-strong">{c.head}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Điểm khác biệt
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-ink">
          Ba việc mà công cụ khác chưa làm
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {USPS.map((u) => (
            <div
              key={u.title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="font-semibold text-ink">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                {u.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature rows */}
      {FEATURES.map((f) => (
        <section
          key={f.title}
          className={f.reverse ? "border-y border-border bg-surface-2" : ""}
        >
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
            <div className={f.reverse ? "lg:order-2" : undefined}>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
                {f.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
                {f.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {f.body}
              </p>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {f.points.map((p) => (
                  <li
                    key={p}
                    className="py-2.5 text-sm leading-snug text-ink-2"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className={f.reverse ? "lg:order-1" : undefined}>
              <BrowserFrame url={f.url}>
                <FrameShot
                  src={f.img}
                  alt={f.alt}
                  heightClass="h-[380px] sm:h-[460px]"
                />
              </BrowserFrame>
            </div>
          </div>
        </section>
      ))}

      {/* Data & method band */}
      <section className="bg-accent-strong text-on-accent">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-accent/70">
            Dữ liệu &amp; phương pháp
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight">
            Tự xây phần “hạ tầng dữ liệu”, vì Việt Nam chưa bắt buộc báo cáo
            chuẩn hoá
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["50", "trường pilot TP.HCM & Hà Nội"],
              ["6", "nhóm ngành hot mùa 2026"],
              ["1", "nguồn chuẩn: đề án tuyển sinh"],
              ["đ/năm", "mọi đơn vị quy về cùng một mốc"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-bold">{n}</div>
                <div className="mt-1 text-sm text-on-accent/80">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 text-sm leading-relaxed text-on-accent/90 sm:grid-cols-3">
            <p>
              <strong>Nguồn.</strong> Số liệu lấy từ đề án tuyển sinh (PDF) và
              thông báo học phí chính thức của trường, không lấy từ bài báo tổng
              hợp.
            </p>
            <p>
              <strong>Chuẩn hoá.</strong> Đồng/tháng, đồng/tín chỉ… đều quy về
              đồng/năm ngay lúc nhập, giữ lại số gốc + đơn vị gốc để đối chiếu.
            </p>
            <p>
              <strong>Đối chiếu tay.</strong> AI chỉ trích xuất; luôn có người
              kiểm tra trước khi ghi vào cơ sở dữ liệu. Cập nhật theo mùa tuyển
              sinh.
            </p>
          </div>
          <Link
            href="/phuong-phap"
            className="mt-8 inline-block rounded-lg bg-on-accent px-5 py-2.5 text-sm font-semibold text-accent-strong"
          >
            Xem phương pháp luận đầy đủ
          </Link>
        </div>
      </section>

      {/* Dark-mode teaser */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
              Dùng ở mọi nơi
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Chế độ tối &amp; bố cục điện thoại
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Phụ huynh tra cứu trên điện thoại giữa mùa tuyển sinh, tư vấn viên
              chiếu trên màn hình lớn. Bảng chuyển thành thẻ trên mobile, bộ lọc
              gấp gọn, thanh so sánh cố định dưới màn hình. Chế độ tối theo cài
              đặt hệ thống của máy.
            </p>
          </div>
          <BrowserFrame url="hocphi.info · dark">
            <FrameShot
              src="/screenshots/dark-mode.png"
              alt="hocphi.info ở chế độ tối: nền navy than, bề mặt xanh đá, màu nhấn xanh sáng."
              heightClass="h-[320px] sm:h-[420px]"
            />
          </BrowserFrame>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink">
            Câu hỏi thường gặp
          </h2>
          <dl className="mt-6 divide-y divide-rule border-y border-rule">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Bắt đầu từ ngành bạn đang cân nhắc
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-2">
          Tra cứu miễn phí, không cần đăng nhập. Dự án phi lợi nhuận, không
          quảng cáo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/nganh"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-on-accent hover:bg-accent-strong"
          >
            Tra cứu theo ngành
          </Link>
          <Link
            href="/tai-tro"
            className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink hover:border-accent-border"
          >
            Ủng hộ dự án
          </Link>
        </div>
      </section>
    </main>
  );
}

// --- local presentational helpers -------------------------------------------
// Only used by this page, so they live here (colocation) instead of components/.

function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface text-left shadow-lg ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 border-b border-rule bg-surface-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 rounded border border-rule bg-surface px-2.5 py-0.5 text-[11px] text-ink-3">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

function FrameShot({
  src,
  alt,
  heightClass,
  priority = false,
}: {
  src: string;
  alt: string;
  heightClass: string;
  priority?: boolean;
}) {
  // next/image with `fill` needs a positioned parent with an explicit height.
  // object-top keeps the useful top of the screenshot in view when the frame is
  // shorter than the image (the mockup's clipped-preview look).
  return (
    <div className={`relative w-full ${heightClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover object-top"
      />
    </div>
  );
}
