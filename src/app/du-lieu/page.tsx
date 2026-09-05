import type { Metadata } from "next";
import Link from "next/link";

import Callout from "@/components/Callout";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Server Component, static. Content from ../mockup/Data.dc.html — coverage
// snapshot + per-school status + change log + source policy. The counts here
// are an illustrative snapshot; when an endpoint exposes coverage, swap the
// literals for a fetch (this becomes `async` and reads from the API).

export const metadata: Metadata = {
  title: "Dữ liệu & nguồn",
  description:
    "Độ phủ dữ liệu học phí hiện tại của hocphi.info: trạng thái từng trường trong 50 trường pilot, nhóm ngành, lịch cập nhật và loại nguồn được chấp nhận.",
  alternates: { canonical: "/du-lieu" },
};

const SNAPSHOT_DATE = "05/09/2026";

const STATS = [
  { n: "12", sub: "/ 50", label: "trường đã có ít nhất 1 ngành" },
  { n: "184", sub: "", label: "chương trình (ngành × hệ × cơ sở)" },
  { n: "176", sub: "", label: "bản ghi học phí theo năm học" },
  { n: "43", sub: "", label: "tài liệu nguồn đã trích dẫn" },
];

const COVERAGE_CITY = [
  { label: "TP. Hồ Chí Minh", value: "8 / 25", pct: 32 },
  { label: "Hà Nội", value: "4 / 25", pct: 16 },
];
const COVERAGE_TYPE = [
  { label: "Công lập tự chủ", value: "6", pct: 45 },
  { label: "Công lập", value: "2", pct: 20 },
  { label: "Tư thục", value: "4", pct: 32 },
];

type Status = "done" | "wip" | "queued" | "blocked";
const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  done: {
    label: "Đã có",
    cls: "bg-tag-green-bg text-tag-green-ink",
  },
  wip: { label: "Đang bổ sung", cls: "bg-warn-bg text-warn-ink" },
  queued: { label: "Trong hàng đợi", cls: "bg-muted-bg text-muted-ink" },
  blocked: { label: "Thiếu nguồn tĩnh", cls: "bg-muted-bg text-muted-ink" },
};

const SCHOOLS: {
  name: string;
  code: string;
  city: string;
  type: string;
  majors: string;
  source: string;
  updated: string;
  status: Status;
}[] = [
  {
    name: "ĐH Công nghệ TP.HCM",
    code: "HUTECH",
    city: "TP.HCM",
    type: "Tư thục",
    majors: "64",
    source: "Đề án TS 2026",
    updated: "03/09",
    status: "done",
  },
  {
    name: "ĐH Khoa học Tự nhiên TP.HCM",
    code: "HCMUS",
    city: "TP.HCM",
    type: "Công lập",
    majors: "27",
    source: "Đề án TS 2026",
    updated: "03/09",
    status: "done",
  },
  {
    name: "ĐH Tôn Đức Thắng",
    code: "TDTU",
    city: "TP.HCM",
    type: "Công lập tự chủ",
    majors: "27",
    source: "Đề án TS 2026 + phụ lục",
    updated: "05/09",
    status: "done",
  },
  {
    name: "ĐH Quốc tế — ĐHQG-HCM",
    code: "IU",
    city: "TP.HCM",
    type: "Công lập tự chủ",
    majors: "23",
    source: "Đề án TS 2026",
    updated: "02/09",
    status: "done",
  },
  {
    name: "ĐH Ngoại ngữ — ĐHQGHN",
    code: "ULIS",
    city: "Hà Nội",
    type: "Công lập tự chủ",
    majors: "10",
    source: "Đề án TS 2026",
    updated: "01/09",
    status: "done",
  },
  {
    name: "ĐH Kinh tế Quốc dân",
    code: "NEU",
    city: "Hà Nội",
    type: "Công lập tự chủ",
    majors: "7",
    source: "Thông báo HP 2026",
    updated: "05/09",
    status: "done",
  },
  {
    name: "ĐH KHXH&NV TP.HCM",
    code: "USSH",
    city: "TP.HCM",
    type: "Công lập",
    majors: "4",
    source: "Đề án TS 2026",
    updated: "04/09",
    status: "done",
  },
  {
    name: "ĐH Công nghệ Thông tin — ĐHQG-HCM",
    code: "UIT",
    city: "TP.HCM",
    type: "Công lập tự chủ",
    majors: "2",
    source: "QĐ học phí 2026 (khtc)",
    updated: "04/09",
    status: "wip",
  },
  {
    name: "ĐH Văn Lang",
    code: "VLU",
    city: "TP.HCM",
    type: "Tư thục",
    majors: "1",
    source: "Bài tin domain trường",
    updated: "05/09",
    status: "wip",
  },
  {
    name: "ĐH Kinh tế – Luật — ĐHQG-HCM",
    code: "UEL",
    city: "TP.HCM",
    type: "Công lập tự chủ",
    majors: "—",
    source: "Đã tải, chờ map",
    updated: "—",
    status: "queued",
  },
  {
    name: "ĐH Công nghệ — ĐHQGHN",
    code: "UET",
    city: "Hà Nội",
    type: "Công lập tự chủ",
    majors: "—",
    source: "Đã tải, chờ map",
    updated: "—",
    status: "queued",
  },
  {
    name: "ĐH Bách khoa Hà Nội",
    code: "HUST",
    city: "Hà Nội",
    type: "Công lập tự chủ",
    majors: "0",
    source: "—",
    updated: "—",
    status: "blocked",
  },
  {
    name: "ĐH RMIT Việt Nam",
    code: "RMIT",
    city: "TP.HCM",
    type: "Tư thục · 100% vốn NN",
    majors: "0",
    source: "—",
    updated: "—",
    status: "blocked",
  },
];

const MAJOR_GROUPS = [
  {
    name: "CNTT / KHMT / AI / KHDL",
    includes:
      "Công nghệ thông tin, Khoa học máy tính, Trí tuệ nhân tạo, Khoa học dữ liệu, An toàn thông tin",
    count: "58",
  },
  {
    name: "Kỹ thuật",
    includes: "Điện – Điện tử, Cơ khí, Ô tô, Vi mạch bán dẫn, Tự động hoá",
    count: "41",
  },
  {
    name: "Kinh tế / Tài chính – Ngân hàng / QTKD",
    includes:
      "Kinh tế, Tài chính – Ngân hàng, Quản trị kinh doanh, Kế toán, Marketing",
    count: "44",
  },
  {
    name: "Y – Dược",
    includes: "Y khoa, Răng – Hàm – Mặt, Dược học, Điều dưỡng, Y tế công cộng",
    count: "18",
  },
  { name: "Luật", includes: "Luật, Luật kinh tế, Luật quốc tế", count: "12" },
  {
    name: "Logistics & Chuỗi cung ứng",
    includes: "Logistics và Quản lý chuỗi cung ứng, Kinh doanh quốc tế",
    count: "11",
  },
];

const CHANGELOG = [
  [
    "05/09/2026",
    "Bổ sung TDTU (3 → 27 ngành) theo chính sách lấy MAX cho dữ liệu dạng khoảng; thêm ĐH Văn Lang (ngành Du lịch, nhãn “ước lượng”).",
  ],
  [
    "05/09/2026",
    "Thêm NEU (7 ngành, hệ tiếng Anh định giá theo khoá — lấy khoá mới nhất) và USSH-HCM (4 ngành).",
  ],
  [
    "04/09/2026",
    "Sửa nguồn UIT: chuyển sang trang Phòng Kế hoạch – Tài chính (khtc) thay cho trang tin chính (render JS).",
  ],
  [
    "03/09/2026",
    "Đợt seed đầu: HUTECH, HCMUS, IU, ULIS — tổng ~124 chương trình từ đề án tuyển sinh 2026.",
  ],
  [
    "02/09/2026",
    "Chốt bảng màu và khung 50 trường pilot; mở trang Dữ liệu & nguồn.",
  ],
];

const th =
  "bg-surface-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-3";
const td = "border-t border-rule px-3 py-2.5 align-middle";

export default function DataPage() {
  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Học phí đại học Việt Nam — pilot 50 trường",
    description:
      "Học phí đại học theo trường × ngành × hệ đào tạo, chuẩn hoá về đồng/năm, kèm ước lượng tổng cả khoá. Giai đoạn pilot: TP.HCM và Hà Nội, 6 nhóm ngành mùa tuyển sinh 2026.",
    inLanguage: "vi-VN",
    creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    temporalCoverage: "2024/2026",
    variableMeasured: "Học phí đại học (đồng/năm)",
    isAccessibleForFree: true,
    url: absoluteUrl("/du-lieu"),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dữ liệu & nguồn",
        item: absoluteUrl("/du-lieu"),
      },
    ],
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-8">
      <JsonLd data={datasetLd} />
      <JsonLd data={breadcrumbLd} />

      <div className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Dữ liệu &amp; nguồn
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-ink">
          Đã có gì, lấy từ đâu, cập nhật khi nào
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
          Giai đoạn pilot tập trung 50 trường ở TP.HCM và Hà Nội, chọn cả trường
          công top đầu (học phí thấp), trường công tự chủ tài chính (trung bình
          – cao) và trường tư (cao) để dữ liệu đủ độ trải cho việc tính trung
          vị.
        </p>
        <p className="mt-3 text-xs text-ink-3">
          Ảnh chụp dữ liệu: {SNAPSHOT_DATE} · dữ liệu khoá tuyển sinh 2026
        </p>
      </div>

      {/* Stats */}
      <section className="py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="text-2xl font-bold text-ink">
                {s.n}
                {s.sub ? (
                  <span className="text-base font-semibold text-ink-3">
                    {" "}
                    {s.sub}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-ink-3">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Callout>
            Độ phủ mở rộng theo từng đợt, không phải “đủ 50 trường” ngay. Ưu
            tiên các trường có đề án tuyển sinh công bố sớm và rõ tới từng
            ngành. Trường có số “0 ngành” thường vì học phí chỉ nằm trên web
            động, không có bản tĩnh để trích dẫn.
          </Callout>
        </div>
      </section>

      {/* Coverage */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">Độ phủ</h2>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">
          <CoverageList title="Theo thành phố" rows={COVERAGE_CITY} />
          <CoverageList title="Theo loại trường" rows={COVERAGE_TYPE} />
        </div>
      </section>

      {/* School status */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Trạng thái từng trường
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          12 trường đã lên dữ liệu, phần còn lại trong 50 trường pilot đang
          trong hàng đợi. “Số ngành” là số chương trình đã đối chiếu và công bố.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th className={th}>Trường</th>
                <th className={th}>Thành phố</th>
                <th className={th}>Loại</th>
                <th className={`${th} text-right`}>Số ngành</th>
                <th className={th}>Nguồn mới nhất</th>
                <th className={th}>Cập nhật</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {SCHOOLS.map((s) => {
                const st = STATUS_STYLE[s.status];
                return (
                  <tr key={s.code}>
                    <td className={td}>
                      <span className="font-semibold text-ink">{s.name}</span>{" "}
                      <span className="text-ink-3">· {s.code}</span>
                    </td>
                    <td className={td}>{s.city}</td>
                    <td className={td}>{s.type}</td>
                    <td className={`${td} text-right`}>{s.majors}</td>
                    <td className={td}>{s.source}</td>
                    <td className={td}>{s.updated}</td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Major groups */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Nhóm ngành pilot
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          Tập trung 6 nhóm ngành thu hút nhiều thí sinh nhất mùa tuyển sinh
          2026.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr>
                <th className={th}>Nhóm ngành</th>
                <th className={th}>Gồm</th>
                <th className={`${th} text-right`}>Ngành đã có</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {MAJOR_GROUPS.map((g) => (
                <tr key={g.name}>
                  <td className={`${td} font-semibold text-ink`}>{g.name}</td>
                  <td className={td}>{g.includes}</td>
                  <td className={`${td} text-right`}>{g.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Changelog */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Thay đổi gần đây
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr>
                <th className={`${th} w-24`}>Ngày</th>
                <th className={th}>Nội dung</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {CHANGELOG.map(([date, text]) => (
                <tr key={date + text}>
                  <td className={td}>{date}</td>
                  <td className={td}>{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Source policy */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Loại nguồn được chấp nhận
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-tag-green-ink">
              ✓ Dùng làm nguồn số
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
              <li>Đề án tuyển sinh (PDF) của năm tương ứng</li>
              <li>Quyết định / thông báo học phí chính thức</li>
              <li>Nghị quyết Hội đồng trường về học phí</li>
              <li>
                Trang “Học phí” trên website chính thức (bảng tĩnh, trích được
                URL)
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-warn-ink">
              ✕ Không dùng
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
              <li>Báo chí tổng hợp, trang điểm chuẩn bên thứ ba</li>
              <li>Diễn đàn, hội nhóm mạng xã hội</li>
              <li>
                Bài viết trên trang tin của trường —{" "}
                <em>
                  chỉ dùng khi không còn nguồn nào khác, và luôn hạ nhãn xuống
                  “ước lượng”
                </em>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-2">
          Chi tiết cách quy đổi và tính toán:{" "}
          <Link href="/phuong-phap" className="text-accent-ink underline">
            Phương pháp luận
          </Link>
          .
        </p>
      </section>

      {/* Contribute + download */}
      <section className="border-t border-rule py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-ink">Thấy số chưa đúng?</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">
              Gửi phản hồi kèm tên trường – ngành và (nếu có) link tài liệu gốc.
              Mỗi báo lỗi được đối chiếu lại trước khi cập nhật.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-ink">
              Tải dữ liệu{" "}
              <span className="rounded-full bg-muted-bg px-2 py-0.5 align-middle text-xs font-semibold text-muted-ink">
                sắp có
              </span>
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">
              Bộ dữ liệu học phí sẽ mở dưới dạng API đọc và file CSV, kèm cột
              nguồn + ngày đối chiếu cho từng dòng, giấy phép cho phép dùng lại
              có ghi nguồn.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function CoverageList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; pct: number }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
        {title}
      </p>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm text-ink-2"
          >
            <span>{r.label}</span>
            <span className="h-2 rounded-full bg-rule">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${r.pct}%` }}
              />
            </span>
            <span className="text-right tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
