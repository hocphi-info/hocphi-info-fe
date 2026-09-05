import type { Metadata } from "next";
import Link from "next/link";

import Callout from "@/components/Callout";
import JsonLd from "@/components/JsonLd";
import { fetchCoverage } from "@/lib/api";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import type {
  CityCode,
  MajorGroupCode,
  SchoolCategory,
  SourceDocType,
} from "@/types/domain";

// Async Server Component. Số liệu (stats, độ phủ, bảng trường, số ngành mỗi nhóm)
// đến từ GET /api/coverage qua ISR (`fetchCoverage`, revalidate 1h) — trang tự
// mới sau mỗi đợt seed BE, không cần deploy lại. Phần văn xuôi bên dưới (nhãn
// trạng thái blocked, mô tả nhóm ngành, changelog, chính sách nguồn) là biên
// tập — không suy ra được từ DB nên giữ ở đây.

export const metadata: Metadata = {
  title: "Dữ liệu & nguồn",
  description:
    "Độ phủ dữ liệu học phí hiện tại của hocphi.info: trạng thái từng trường trong 50 trường pilot, nhóm ngành, lịch cập nhật và loại nguồn được chấp nhận.",
  alternates: { canonical: "/du-lieu" },
};

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

// Nhãn trạng thái không suy ra được từ số đếm — giữ ở FE. `blocked` = học phí chỉ
// nằm trên web động, không có bản tĩnh để trích. Trường không có ở đây: nPrograms
// > 0 → "done", = 0 → "queued".
const STATUS_OVERRIDES: Record<string, Status> = {
  hust: "blocked",
  "rmit-vietnam": "blocked",
};

const CITY_LABEL: Record<CityCode, string> = {
  HCM: "TP. Hồ Chí Minh",
  HN: "Hà Nội",
};

const CATEGORY_LABEL: Record<SchoolCategory, string> = {
  cong_lap: "Công lập",
  cong_lap_tu_chu: "Công lập tự chủ",
  tu_thuc: "Tư thục",
  tu_thuc_von_nuoc_ngoai: "Vốn nước ngoài",
};

const DOC_TYPE_LABEL: Record<SourceDocType, string> = {
  de_an_tuyen_sinh: "Đề án tuyển sinh",
  thong_bao_hoc_phi: "Thông báo học phí",
  quy_dinh_nghe: "Quy định nghề",
  khac: "Nguồn khác",
};

// Tên hiển thị + "gồm" của mỗi nhóm ngành — biên tập. Số "ngành đã có" lấy từ
// coverage.byMajorGroup theo groupCode.
const MAJOR_GROUP_INFO: Record<
  MajorGroupCode,
  { name: string; includes: string }
> = {
  CNTT: {
    name: "CNTT / KHMT / AI / KHDL",
    includes:
      "Công nghệ thông tin, Khoa học máy tính, Trí tuệ nhân tạo, Khoa học dữ liệu, An toàn thông tin",
  },
  KY_THUAT: {
    name: "Kỹ thuật",
    includes: "Điện – Điện tử, Cơ khí, Ô tô, Vi mạch bán dẫn, Tự động hoá",
  },
  KINH_TE: {
    name: "Kinh tế / Tài chính – Ngân hàng / QTKD",
    includes:
      "Kinh tế, Tài chính – Ngân hàng, Quản trị kinh doanh, Kế toán, Marketing",
  },
  Y_DUOC: {
    name: "Y – Dược",
    includes: "Y khoa, Răng – Hàm – Mặt, Dược học, Điều dưỡng, Y tế công cộng",
  },
  LUAT: { name: "Luật", includes: "Luật, Luật kinh tế, Luật quốc tế" },
  LOGISTICS: {
    name: "Logistics & Chuỗi cung ứng",
    includes: "Logistics và Quản lý chuỗi cung ứng, Kinh doanh quốc tế",
  },
};

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

/** "2026-09-05" -> "05/09/2026" (year) hoặc "05/09" (no year); null -> "—". */
function formatDate(iso: string | null, opts: { year?: boolean } = {}): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return opts.year ? `${d}/${m}/${y}` : `${d}/${m}`;
}

/** "Thông báo học phí 2026" từ doc_type + published_date; "—" nếu chưa có nguồn. */
function sourceLabel(
  docType: SourceDocType | null,
  date: string | null,
): string {
  if (!docType) return "—";
  const year = date ? ` ${date.slice(0, 4)}` : "";
  return `${DOC_TYPE_LABEL[docType]}${year}`;
}

export default async function DataPage() {
  const coverage = await fetchCoverage();
  const { totals, snapshotDate } = coverage;

  const stats = [
    {
      n: String(totals.schoolsWithData),
      sub: `/ ${totals.schoolsTotal}`,
      label: "trường đã có ít nhất 1 ngành",
    },
    {
      n: String(totals.programsWithTuition),
      sub: "",
      label: "chương trình (ngành × hệ × cơ sở)",
    },
    {
      n: String(totals.tuitionRecords),
      sub: "",
      label: "bản ghi học phí theo năm học",
    },
    {
      n: String(totals.sourcesCited),
      sub: "",
      label: "tài liệu nguồn đã trích dẫn",
    },
  ];

  const cityRows = coverage.byCity.map((r) => ({
    label: CITY_LABEL[r.cityCode],
    value: `${r.schoolsWithData} / ${r.schoolsTotal}`,
    pct: r.schoolsTotal ? (r.schoolsWithData / r.schoolsTotal) * 100 : 0,
  }));
  const typeRows = coverage.byCategory.map((r) => ({
    label: CATEGORY_LABEL[r.category],
    value: `${r.schoolsWithData} / ${r.schoolsTotal}`,
    pct: r.schoolsTotal ? (r.schoolsWithData / r.schoolsTotal) * 100 : 0,
  }));

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
          Giai đoạn đầu tập trung 50 trường ở TP.HCM và Hà Nội, chọn cả trường
          công top đầu (học phí thấp), trường công tự chủ tài chính (trung bình
          – cao) và trường tư (cao) để dữ liệu đủ độ trải cho việc tính trung
          vị.
        </p>
        <p className="mt-3 text-xs text-ink-3">
          Ngày cập nhập: {formatDate(snapshotDate, { year: true })}
        </p>
      </div>

      {/* Stats */}
      <section className="py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
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
            ngành. Trường có số “0 ngành” thường vì học phí chỉ nằm trên dynamic
            web, không có bản tĩnh để trích xuất.
          </Callout>
        </div>
      </section>

      {/* Coverage */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">Độ phủ</h2>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">
          <CoverageList title="Theo thành phố" rows={cityRows} />
          <CoverageList title="Theo loại trường" rows={typeRows} />
        </div>
      </section>

      {/* School status */}
      <section className="border-t border-rule py-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Trạng thái từng trường
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          {totals.schoolsWithData} trường đã lên dữ liệu, phần còn lại trong 50
          trường pilot đang trong hàng đợi. “Số ngành” là số chương trình đã đối
          chiếu và công bố.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-180 text-sm">
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
              {coverage.schools.map((s) => {
                const status: Status =
                  STATUS_OVERRIDES[s.slug] ??
                  (s.nPrograms > 0 ? "done" : "queued");
                const st = STATUS_STYLE[status];
                return (
                  <tr key={s.slug}>
                    <td className={td}>
                      <span className="font-semibold text-ink">{s.name}</span>{" "}
                      {s.shortName ? (
                        <span className="text-ink-3">· {s.shortName}</span>
                      ) : null}
                    </td>
                    <td className={td}>{CITY_LABEL[s.cityCode]}</td>
                    <td className={td}>{CATEGORY_LABEL[s.category]}</td>
                    <td className={`${td} text-right`}>{s.nPrograms}</td>
                    <td className={td}>
                      {sourceLabel(s.latestSourceDocType, s.latestSourceDate)}
                    </td>
                    <td className={td}>{formatDate(s.lastUpdated)}</td>
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
          <table className="w-full min-w-140 text-sm">
            <thead>
              <tr>
                <th className={th}>Nhóm ngành</th>
                <th className={th}>Gồm</th>
                <th className={`${th} text-right`}>Ngành đã có</th>
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {coverage.byMajorGroup.map((row) => {
                const info = MAJOR_GROUP_INFO[row.groupCode];
                return (
                  <tr key={row.groupCode}>
                    <td className={`${td} font-semibold text-ink`}>
                      {info?.name ?? row.groupName}
                    </td>
                    <td className={td}>{info?.includes ?? ""}</td>
                    <td className={`${td} text-right`}>
                      {row.programsWithTuition}
                    </td>
                  </tr>
                );
              })}
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
          <table className="w-full min-w-120 text-sm">
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
