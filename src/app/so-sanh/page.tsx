import { Suspense } from "react";
import { fetchMajorRows, fetchProgramDetailSafe } from "@/lib/api";
import { medianPerYear } from "@/lib/derive";
import { parseCompareIds, resolveCompareItems } from "@/lib/compare";
import CompareEmptyState from "@/components/CompareEmptyState";
import CompareView, { type CompareItemData } from "@/components/CompareView";

// Server Component — trang so sánh (S5, F8, Tuần 5). `Program.id` (id được
// CompareCheckbox ở /nganh chọn) không tự fetch chi tiết được — phải tra qua
// fetchMajorRows() để lấy (schoolSlug, majorSlug) rồi mới gọi
// fetchProgramDetailSafe. Khác route F6 (1 lỗi = cả trang 404), ở đây id/mục
// lỗi chỉ bị lặng lẽ bỏ qua — trang vẫn render các mục còn hợp lệ.
export default async function ComparePage({
  searchParams,
}: PageProps<"/so-sanh">) {
  const sp = await searchParams;
  const ids = parseCompareIds(sp);
  const majorRows = await fetchMajorRows();
  const { resolved, missingIds } = resolveCompareItems(ids, majorRows);

  if (resolved.length < 2) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">So sánh</h1>
        <CompareEmptyState
          remaining={
            resolved[0] && { id: resolved[0].id, label: resolved[0].label }
          }
        />
      </main>
    );
  }

  const details = await Promise.all(
    resolved.map((r) => fetchProgramDetailSafe(r.schoolSlug, r.majorSlug)),
  );

  const items: CompareItemData[] = [];
  const failedIds = [...missingIds];

  resolved.forEach((ref, i) => {
    const detail = details[i];
    const program = detail?.programs.find((p) => p.program.id === ref.id);
    if (!detail || !program) {
      failedIds.push(ref.id);
      return;
    }
    items.push({
      id: ref.id,
      label: ref.label,
      schoolName: detail.school.name,
      majorName: detail.major.name,
      track: ref.track,
      year1Amount: program.year1.amountPerYear,
      medianPerYearAmount: medianPerYear(program.yearlyAmounts),
      totalCourse: program.totalCourse,
      increasePct: program.increase?.annualIncreasePct ?? null,
      increaseSource: program.increase?.increaseSource ?? null,
      source: program.year1.source,
      yearlyAmounts: program.yearlyAmounts,
    });
  });

  if (items.length < 2) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">So sánh</h1>
        <CompareEmptyState
          remaining={items[0] && { id: items[0].id, label: items[0].label }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">So sánh</h1>

      <Suspense fallback={null}>
        <CompareView initialItems={items} missingCount={failedIds.length} />
      </Suspense>
    </main>
  );
}
