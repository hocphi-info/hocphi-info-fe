import Link from "next/link";
import { fetchProgramDetail } from "@/lib/api";
import { campusLabel, formatMillions, TRACK_LABELS } from "@/lib/format";
import TuitionTrendChart from "@/components/TuitionTrendChart";
import SourceBlock from "@/components/SourceBlock";
import SchoolLogo from "@/components/SchoolLogo";
import PostGradCostBlock from "@/components/PostGradCostBlock";

// Server Component — F6, S3. `fetchProgramDetail` (lib/api.ts) already calls
// `notFound()` on a 404 from the BE, so nothing here needs to check that —
// any slug pair that doesn't resolve to a program just renders the app's
// not-found.tsx instead of this page.
export default async function ProgramDetailPage({
  params,
}: PageProps<"/nganh/[truong]/[nganh]">) {
  const { truong, nganh } = await params;
  const detail = await fetchProgramDetail(truong, nganh);

  // Ngành này có chương trình ở nhiều cơ sở (vd TDTU Du lịch: cơ sở chính +
  // Phân hiệu Khánh Hòa)? Nếu có thì gắn nhãn cơ sở lên MỌI section — kể cả
  // "Cơ sở chính" — để tương phản rõ; ngành 1 cơ sở thì heading giữ nguyên.
  const hasMultipleCampuses =
    new Set(detail.programs.map((p) => p.program.campus)).size > 1;

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-6">
      <div className="flex items-center gap-2">
        <SchoolLogo
          logoUrl={detail.school.logoUrl}
          name={detail.school.name}
          shortName={detail.school.shortName}
        />
        <Link
          href={`/truong/${detail.school.slug}`}
          className="text-sm text-ink-3 hover:text-accent hover:underline"
        >
          {detail.school.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {detail.major.name}
      </h1>

      <div className="mt-6 space-y-8">
        {detail.programs.map((p) => (
          <section key={p.program.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {TRACK_LABELS[p.program.track]}
                {/* Cùng (trường, ngành, hệ) có thể có nhiều cơ sở với học phí
                    khác nhau — nêu rõ cơ sở để không nhầm giá phân hiệu là giá
                    chung. BE sắp cơ sở chính lên trước (campus NULLS FIRST). */}
                {hasMultipleCampuses && (
                  <span className="text-ink-3">
                    {" · "}
                    {campusLabel(p.program.campus)}
                  </span>
                )}
              </h2>
              {p.program.displayName &&
                p.program.displayName !== detail.major.name && (
                  <p className="mt-0.5 text-sm text-ink-3">
                    {p.program.displayName}
                  </p>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-ink-3">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Năm học
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      Học phí/năm
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      Loại số liệu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {p.yearlyAmounts.map((y) => (
                    <tr
                      key={y.academicYear}
                      className="border-b border-rule last:border-b-0"
                    >
                      <td className="px-3 py-2 text-ink">{y.academicYear}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink">
                        {formatMillions(y.amountPerYear)}
                      </td>
                      <td className="px-3 py-2 text-right text-ink-3">
                        {y.isProjected ? "Dự phóng" : "Công bố"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TuitionTrendChart yearlyAmounts={p.yearlyAmounts} />

            <p className="text-ink">
              Tổng học phí cả khoá (ước lượng):{" "}
              <b className="tabular-nums">{formatMillions(p.totalCourse)}</b>
            </p>

            <SourceBlock source={p.year1.source} />
          </section>
        ))}

        <PostGradCostBlock major={detail.major} />
      </div>
    </main>
  );
}
