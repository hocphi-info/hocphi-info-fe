import type { Metadata } from "next";
import Link from "next/link";

import Callout from "@/components/Callout";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Server Component, fully static. Content from ../mockup/Method.dc.html — the
// rules behind every number: sources, the extract → human-check pipeline, unit
// normalisation, median-by-track, whole-course estimation, confidence labels,
// hard cases, what's excluded, update cadence.

export const metadata: Metadata = {
  title: "Phương pháp luận",
  description:
    "Cách hocphi.info lấy, chuẩn hoá và tính học phí: nguồn từ đề án tuyển sinh, quy mọi đơn vị về đồng/năm, trung vị tách theo hệ, ước lượng tổng cả khoá theo % tăng.",
  alternates: { canonical: "/phuong-phap" },
};

const SECTIONS = [
  { id: "nguon", label: "1 · Nguồn dữ liệu" },
  { id: "quy-trinh", label: "2 · Quy trình đối chiếu" },
  { id: "chuan-hoa", label: "3 · Chuẩn hoá đơn vị" },
  { id: "trung-vi", label: "4 · Trung vị theo hệ" },
  { id: "uoc-luong", label: "5 · Ước lượng cả khoá" },
  { id: "tin-cay", label: "6 · Mức độ tin cậy" },
  { id: "truong-hop-kho", label: "7 · Trường hợp đặc biệt" },
  { id: "khong-bao-gom", label: "8 · Không bao gồm" },
  { id: "cap-nhat", label: "9 · Lịch cập nhật" },
];

const th =
  "bg-surface-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-3";
const td = "border-t border-rule px-3 py-2.5 align-top";

export default function MethodPage() {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Phương pháp luận — hocphi.info",
    description:
      "Cách thu thập, chuẩn hoá và tính học phí đại học trên hocphi.info.",
    inLanguage: "vi-VN",
    datePublished: "2026-09-06",
    dateModified: "2026-09-06",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: absoluteUrl("/phuong-phap"),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Phương pháp luận",
        item: absoluteUrl("/phuong-phap"),
      },
    ],
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-8">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />

      <div className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Phương pháp luận
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-ink">
          Số liệu này được lấy, chuẩn hoá và tính như thế nào
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Việt Nam chưa có nguồn dữ liệu học phí chuẩn hoá kiểu IPEDS (Mỹ) hay
          College Scorecard — mỗi trường công bố học phí riêng lẻ trong đề án
          tuyển sinh dạng PDF, đơn vị tính khác nhau. hocphi.info tự dựng lớp
          “hạ tầng dữ liệu” đó. Trang này mô tả toàn bộ quy tắc, đủ để bạn tự
          kiểm lại bất kỳ con số nào.
        </p>
        <p className="mt-3 text-xs text-ink-3">
          Cập nhật quy tắc: 09/2026 · Áp dụng cho dữ liệu khoá tuyển sinh 2026
        </p>
      </div>

      <div className="mt-8 gap-10 lg:grid lg:grid-cols-[190px_1fr]">
        <nav className="mb-8 text-sm lg:sticky lg:top-6 lg:mb-0 lg:self-start">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block border-l-2 border-rule py-1 pl-3 text-ink-2 hover:border-accent-border hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-12">
          {/* 1 */}
          <section id="nguon" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              1 · Nguồn dữ liệu
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Chỉ lấy từ tài liệu do chính trường phát hành. Không lấy số từ bài
              báo tổng hợp.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr>
                    <th className={`${th} w-10`}>#</th>
                    <th className={th}>Loại nguồn</th>
                    <th className={th}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>1</td>
                    <td className={td}>
                      <strong className="text-ink">Đề án tuyển sinh</strong>{" "}
                      (PDF) của năm tuyển sinh tương ứng
                    </td>
                    <td className={td}>
                      Nguồn chuẩn. Thường có bảng học phí theo ngành/hệ + đôi
                      khi lộ trình tăng 3–5 năm.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>2</td>
                    <td className={td}>
                      <strong className="text-ink">
                        Thông báo / quyết định học phí
                      </strong>{" "}
                      chính thức, nghị quyết Hội đồng trường
                    </td>
                    <td className={td}>
                      Dùng khi đề án không nêu chi tiết tới từng ngành.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>3</td>
                    <td className={td}>
                      Trang “Học phí” trên website chính thức của trường
                    </td>
                    <td className={td}>
                      Chấp nhận nếu là bảng số tĩnh, trích dẫn được URL.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>4</td>
                    <td className={td}>
                      Bài viết trên trang tin của chính trường (domain trường)
                    </td>
                    <td className={td}>
                      Chỉ khi 1–3 không có. Luôn hạ mức tin cậy, ghi rõ lý do.
                    </td>
                  </tr>
                  <tr>
                    <td className={`${td} text-warn-ink`}>✕</td>
                    <td className={`${td} text-ink-3`}>
                      Báo chí tổng hợp, diễn đàn, trang điểm chuẩn bên thứ ba
                    </td>
                    <td className={`${td} text-ink-3`}>
                      Không dùng làm nguồn số. Chỉ để biết cần đi tìm tài liệu
                      gốc nào.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Callout>
                Một số trường (RMIT, Văn Lang, một số chương trình HUST…) chỉ
                công bố học phí trên trang web dựng bằng JavaScript, không có
                bản PDF/tĩnh nào. Khi không lấy được số từ nguồn tĩnh, ngành đó{" "}
                <strong className="text-ink">tạm chưa đưa lên</strong> thay vì
                đoán.
              </Callout>
            </div>
          </section>

          {/* 2 */}
          <section id="quy-trinh" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              2 · Quy trình đối chiếu
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              AI hỗ trợ trích xuất, người luôn là bước cuối trước khi số vào cơ
              sở dữ liệu.
            </p>
            <ol className="mt-4 space-y-3">
              {[
                [
                  "Tìm nguồn.",
                  "Xác định đề án tuyển sinh / quyết định học phí mới nhất của trường, tải file gốc.",
                ],
                [
                  "Cắt lát.",
                  "Khoanh đúng trang / bảng chứa học phí để giảm nhiễu.",
                ],
                [
                  "Trích xuất.",
                  "Đọc trực tiếp bảng, ghi lại từng dòng: ngành, hệ đào tạo, năm học, số tiền, đơn vị gốc, và trích dẫn (URL + số trang).",
                ],
                [
                  "Kiểm tự động.",
                  "Bộ kiểm tra chặn các lỗi hay gặp: nhân đơn giá tín chỉ với số tín chỉ mặc định, số lệch bất thường so với năm trước, đơn vị không nhận diện được.",
                ],
                [
                  "Người đối chiếu.",
                  "Một người mở lại tài liệu gốc, so từng dòng, gắn mức độ tin cậy, rồi mới ghi vào cơ sở dữ liệu.",
                ],
              ].map(([lead, rest], i) => (
                <li key={lead} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-bg text-xs font-bold text-accent-strong">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-2">
                    <strong className="text-ink">{lead}</strong> {rest}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* 3 */}
          <section id="chuan-hoa" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              3 · Chuẩn hoá đơn vị
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-3">
              Mọi mức học phí quy về{" "}
              <strong className="text-ink">đồng/năm</strong> ngay lúc nhập. Số
              gốc và đơn vị gốc được giữ lại để đối chiếu khi có tranh chấp.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr>
                    <th className={th}>Đơn vị gốc trường công bố</th>
                    <th className={th}>Cách quy về đồng/năm</th>
                    <th className={th}>Ví dụ</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>đồng / năm học</td>
                    <td className={td}>giữ nguyên</td>
                    <td className={td}>33.000.000 → 33,0 tr</td>
                  </tr>
                  <tr>
                    <td className={td}>đồng / học kỳ</td>
                    <td className={td}>
                      × số học kỳ/năm trường quy định (thường 2, có trường 3)
                    </td>
                    <td className={td}>16,5 tr × 2 → 33,0 tr</td>
                  </tr>
                  <tr>
                    <td className={td}>đồng / tháng</td>
                    <td className={td}>
                      × 10 tháng (năm học), trừ khi trường ghi rõ 12
                    </td>
                    <td className={td}>3,3 tr × 10 → 33,0 tr</td>
                  </tr>
                  <tr>
                    <td className={td}>đồng / tín chỉ</td>
                    <td className={td}>
                      × số tín chỉ{" "}
                      <strong className="text-ink">thực tế của năm đó</strong>{" "}
                      nếu trường công bố;{" "}
                      <strong className="text-warn-ink">không</strong> dùng số
                      tín chỉ mặc định
                    </td>
                    <td className={td}>1,1 tr × 30 tc → 33,0 tr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Callout tone="warn" title="Bẫy hay gặp">
                Nhiều quyết định học phí hệ chất lượng cao ghi 2–3 mức đơn
                giá/tín chỉ trong cùng một bảng (môn chung / dạy tiếng Việt /
                dạy tiếng Anh). Lấy nhầm dòng rồi nhân số tín chỉ mặc định sẽ ra
                một con số sai hoàn toàn. Khi không tách được, ngành đó bị giữ
                lại chờ rà, không đưa lên.
              </Callout>
            </div>
          </section>

          {/* 4 */}
          <section id="trung-vi" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              4 · Trung vị, tách riêng theo hệ đào tạo
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-3">
              Học phí hệ chất lượng cao / tiên tiến / quốc tế có thể gấp 3–5 lần
              hệ đại trà. Gộp chung rồi lấy trung bình sẽ ra con số không đại
              diện cho hệ nào.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-warn-ink">
                  ✕ Gộp chung → trung bình
                </p>
                <p className="mt-2 text-sm text-ink-2">
                  28 · 30 · 31 · 33 · <span className="text-warn-ink">72</span>{" "}
                  · <span className="text-warn-ink">333</span>
                </p>
                <p className="mt-2 text-sm text-ink-2">
                  Trung bình ={" "}
                  <strong className="text-warn-ink">87,8 tr</strong> — không
                  ngành nào có mức này.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
                  ✓ Tách hệ → trung vị mỗi hệ
                </p>
                <div className="mt-2 space-y-1 text-sm text-ink-2">
                  <p>
                    Đại trà: 28 · 30 · 31 · 33 → trung vị{" "}
                    <strong className="text-ink">30,5 tr</strong>
                  </p>
                  <p>
                    Tư thục / CT chuẩn:{" "}
                    <strong className="text-ink">72 tr</strong> · hiện riêng
                  </p>
                  <p>
                    Quốc tế: <strong className="text-ink">333 tr</strong> · hiện
                    riêng
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              Bốn hệ được phân biệt:{" "}
              <strong className="text-ink">đại trà</strong>,{" "}
              <strong className="text-ink">chất lượng cao</strong> (gồm “tăng
              cường ngoại ngữ”, “chất lượng cao dạy bằng tiếng Anh”),{" "}
              <strong className="text-ink">tiên tiến</strong>,{" "}
              <strong className="text-ink">quốc tế / liên kết</strong>. Trung vị
              hiển thị trên trang tra cứu chỉ tính trên hệ đại trà; các hệ còn
              lại luôn được liệt kê tách riêng. Với trang “theo trường”, cùng lý
              do, không có một con số trung bình cho cả trường — thay vào đó là{" "}
              <strong className="text-ink">khoảng thấp nhất – cao nhất</strong>{" "}
              giữa các ngành hệ đại trà, kèm trung vị.
            </p>
          </section>

          {/* 5 */}
          <section id="uoc-luong" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              5 · Ước lượng tổng học phí cả khoá
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-3">
              Đây là con số phụ huynh cần để lập kế hoạch tài chính, và luôn là{" "}
              <strong className="text-ink">ước lượng</strong> — nhãn này đi kèm
              mọi nơi nó xuất hiện.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface-2 p-4 text-xs leading-relaxed text-ink">
              {`Năm 1  = học phí trường công bố cho khoá nhập học 2026
Năm k  = Năm 1 × (1 + g)^(k−1)          (k ≥ 2)
Tổng   = Σ (Năm 1 … Năm N)              N = số năm chuẩn của ngành (4, 5 hoặc 6)`}
            </pre>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Chọn <strong className="text-ink">g</strong> (mức tăng hằng năm)
              theo thứ tự: (1) lộ trình trường công bố trong đề án tuyển sinh;
              (2) nếu không có, mức mặc định{" "}
              <strong className="text-ink">10%/năm</strong> — và dòng đó được
              đánh dấu “ước lượng”.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-120 text-sm">
                <caption className="px-3 py-2 text-left text-xs text-ink-3">
                  Ví dụ: ngành Luật, ĐH Luật TP.HCM — hệ đại trà, g = 9%/năm
                  (trường công bố)
                </caption>
                <thead>
                  <tr>
                    <th className={th}>Năm học</th>
                    <th className={`${th} text-right`}>Học phí năm</th>
                    <th className={th}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>Năm 1 · 2026–27</td>
                    <td className={`${td} text-right font-semibold text-ink`}>
                      28,8 tr
                    </td>
                    <td className={td}>số công bố</td>
                  </tr>
                  <tr>
                    <td className={td}>Năm 2 · 2027–28</td>
                    <td className={`${td} text-right`}>31,4 tr</td>
                    <td className={td}>× 1,09</td>
                  </tr>
                  <tr>
                    <td className={td}>Năm 3 · 2028–29</td>
                    <td className={`${td} text-right`}>34,2 tr</td>
                    <td className={td}>× 1,09²</td>
                  </tr>
                  <tr>
                    <td className={td}>Năm 4 · 2029–30</td>
                    <td className={`${td} text-right`}>37,3 tr</td>
                    <td className={td}>× 1,09³</td>
                  </tr>
                  <tr className="bg-accent-bg">
                    <td className={`${td} font-semibold text-ink`}>
                      Tổng 4 năm cử nhân
                    </td>
                    <td className={`${td} text-right font-semibold text-ink`}>
                      ≈ 131,7 tr
                    </td>
                    <td className={td}>chưa gồm mục 8</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6 */}
          <section id="tin-cay" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              6 · Mức độ tin cậy của mỗi dòng
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Mỗi bản ghi học phí mang một nhãn tin cậy, hiện ngay trên trang
              chi tiết.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr>
                    <th className={th}>Nhãn</th>
                    <th className={th}>Nghĩa</th>
                    <th className={th}>Khi nào gắn</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>
                      <span className="rounded-full bg-tag-green-bg px-2 py-0.5 text-xs font-semibold text-tag-green-ink">
                        Đã xác minh
                      </span>
                    </td>
                    <td className={td}>
                      Số khớp với tài liệu gốc của trường, người đã đối chiếu.
                    </td>
                    <td className={td}>
                      Nguồn loại 1–2, bảng rõ tới từng ngành/hệ.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      <span className="rounded-full bg-muted-bg px-2 py-0.5 text-xs font-semibold text-muted-ink">
                        Công bố, chưa rà kỹ
                      </span>
                    </td>
                    <td className={td}>
                      Lấy từ nguồn của trường nhưng còn điểm cần xác nhận (đơn
                      vị, phạm vi ngành).
                    </td>
                    <td className={td}>
                      Nguồn loại 3–4, hoặc bảng gộp nhiều ngành.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn-ink">
                        Ước lượng
                      </span>
                    </td>
                    <td className={td}>
                      Có suy luận: lấy MAX của một khoảng, dùng g mặc định, hoặc
                      nguồn là bài viết.
                    </td>
                    <td className={td}>
                      Dữ liệu dạng khoảng / nhóm nhiều ngành; thiếu lộ trình
                      tăng.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7 */}
          <section id="truong-hop-kho" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              7 · Cách xử lý các trường hợp khó
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr>
                    <th className={`${th} w-1/3`}>Tình huống</th>
                    <th className={th}>Quy ước</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>
                      Trường chỉ công bố{" "}
                      <strong className="text-ink">khoảng giá</strong> hoặc một
                      mức cho{" "}
                      <strong className="text-ink">nhóm nhiều ngành</strong>
                    </td>
                    <td className={td}>
                      Lấy{" "}
                      <strong className="text-ink">
                        giá trị lớn nhất (MAX)
                      </strong>{" "}
                      của khoảng, hạ mức tin cậy xuống “ước lượng”, ghi rõ đây
                      là MAX của khoảng nào / nhóm ngành nào.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      Định giá theo{" "}
                      <strong className="text-ink">khoá nhập học</strong> (khoá
                      mới học phí cao hơn khoá cũ trong cùng một năm)
                    </td>
                    <td className={td}>
                      Luôn lấy mức của{" "}
                      <strong className="text-ink">
                        khoá mới nhất đang tuyển
                      </strong>{" "}
                      (khoá 2026). Ghi chú số của các khoá trước trong phần lý
                      do.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      Trường có nhiều “hệ” hơn 4 nhóm chuẩn (POHE, tiên tiến, ~9
                      mức giá tiếng Anh riêng…)
                    </td>
                    <td className={td}>
                      Gán vào nhóm gần nghĩa nhất trong 4 hệ, luôn đánh dấu để
                      rà lại, nêu tên hệ gốc của trường ở trang chi tiết.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      Học phí công bố theo tín chỉ học phí (TCHP) nhưng không
                      cho tổng tín chỉ/năm
                    </td>
                    <td className={td}>
                      Không quy đổi (sẽ phải đoán). Ngành giữ lại chờ trường
                      công bố đủ.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>
                      Chương trình liên kết quốc tế chỉ công bố học phí{" "}
                      <strong className="text-ink">giai đoạn 1</strong> (học tại
                      VN)
                    </td>
                    <td className={td}>
                      Không tạo dòng “cả khoá”; chỉ ghi phần có số thật, nêu rõ
                      phạm vi.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 8 */}
          <section id="khong-bao-gom" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              8 · Những khoản KHÔNG nằm trong con số học phí
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Học phí trên hocphi.info là học phí đóng cho trường theo chương
              trình đào tạo chính. Không bao gồm:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Sinh hoạt phí, chỗ ở, đi lại",
                "Giáo trình, tài liệu",
                "Học lại, học cải thiện",
                "Lệ phí nhập học, bảo hiểm",
                "Học kỳ tiếng Anh dự bị (nếu có)",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-ink-2"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              <strong className="text-ink">
                Chi phí sau tốt nghiệp để hành nghề
              </strong>{" "}
              — với các ngành như Luật, Y – Dược, Kiểm toán, Kiến trúc — được
              nêu <strong className="text-ink">riêng</strong> ở trang chi tiết
              ngành, đánh dấu “chưa xác minh từng trường” vì tổng hợp từ quy
              định chung của ngành, không phải từ đề án tuyển sinh.
            </p>
          </section>

          {/* 9 */}
          <section id="cap-nhat" className="scroll-mt-6">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              9 · Lịch cập nhật
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Dữ liệu học phí gắn với{" "}
              <strong className="text-ink">khoá tuyển sinh</strong>. Chu kỳ mỗi
              năm:
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-120 text-sm">
                <thead>
                  <tr>
                    <th className={th}>Thời điểm</th>
                    <th className={th}>Việc</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  <tr>
                    <td className={td}>Tháng 2 – 4</td>
                    <td className={td}>
                      Các trường công bố đề án tuyển sinh năm mới. Bắt đầu thu
                      thập, đối chiếu.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>Tháng 5 – 6</td>
                    <td className={td}>
                      Chốt số cho mùa tuyển sinh, đẩy lên đồng loạt. Rà lại các
                      dòng “ước lượng” của năm trước.
                    </td>
                  </tr>
                  <tr>
                    <td className={td}>Trong năm</td>
                    <td className={td}>
                      Cập nhật khi có quyết định điều chỉnh học phí, hoặc khi
                      người dùng báo sai và đối chiếu lại đúng.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-ink-2">
              Xem trạng thái từng trường và thay đổi gần đây ở trang{" "}
              <Link href="/du-lieu" className="text-accent-ink underline">
                Dữ liệu &amp; nguồn
              </Link>
              .
            </p>
          </section>

          <Callout tone="warn">
            Số liệu trên hocphi.info mang tính tham khảo để lập kế hoạch,{" "}
            <strong className="text-ink">không phải tư vấn tài chính</strong> và
            không phải cam kết của nhà trường. Học phí thực tế do trường quyết
            định và có thể thay đổi.
          </Callout>
        </div>
      </div>
    </main>
  );
}
