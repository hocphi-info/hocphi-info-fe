import { fetchSchoolDetail } from "@/lib/api";
import { TRACK_LABELS } from "@/lib/format";
import RangeChart from "@/components/RangeChart";
import SchoolTypeBadge from "@/components/SchoolTypeBadge";
import SchoolLogo from "@/components/SchoolLogo";
import SchoolProgramsTable from "@/components/SchoolProgramsTable";

// Server Component — F7. `fetchSchoolDetail` (lib/api.ts) already calls
// `notFound()` on a 404 from the BE (trường không tồn tại, hoặc chưa có
// chương trình nào đã seed) — nothing here needs to check that.
export default async function SchoolDetailPage({
  params,
}: PageProps<"/truong/[truong]">) {
  const { truong } = await params;
  const detail = await fetchSchoolDetail(truong);

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <SchoolLogo
          logoUrl={detail.school.logoUrl}
          name={detail.school.name}
          shortName={detail.school.shortName}
          size="md"
        />
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {detail.school.name}
        </h1>
        <SchoolTypeBadge category={detail.school.category} />
      </div>
      <p className="mt-1 text-sm text-ink-3">
        {detail.school.shortName} · {detail.programs.length} chương trình đã có
        dữ liệu
      </p>

      <div className="mt-6 space-y-6">
        <RangeChart
          title="Khoảng học phí theo hệ đào tạo"
          subtitle="triệu đồng / năm"
          tableCaption={`Khoảng học phí theo hệ đào tạo — ${detail.school.name}`}
          rows={detail.trackStats.map((t) => ({
            key: t.track,
            label: TRACK_LABELS[t.track],
            nPrograms: t.nPrograms,
            minAmount: t.minAmount,
            minLabel: t.minMajorName,
            medianAmount: t.medianAmount,
            maxAmount: t.maxAmount,
            maxLabel: t.maxMajorName,
          }))}
        />

        <SchoolProgramsTable
          schoolSlug={detail.school.slug}
          rows={detail.programs}
        />
      </div>
    </main>
  );
}
