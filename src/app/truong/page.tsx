import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchMajorRows } from "@/lib/api";
import ViewModeToggle from "@/components/ViewModeToggle";
import SchoolResultsView from "@/components/SchoolResultsView";
import ResultsSkeleton from "@/components/ResultsSkeleton";

import { pageMetadata } from "@/lib/seo";
import CommentSection from "@/components/CommentSection";

export const metadata: Metadata = pageMetadata({
  title: "Tra cứu học phí đại học theo trường",
  description:
    "Học phí các trường đại học Việt Nam: khoảng học phí thấp nhất đến cao nhất theo hệ đào tạo, trung vị và số ngành đã có dữ liệu của từng trường.",
  path: "/truong",
});

// Server Component. Unlike Week 2, this fetches the by-MAJOR rows (the same
// endpoint /nganh uses) and lets the client SchoolResultsView group them into
// per-school min/median/max. Reason (Week 3 plan §2): the "cơ sở tính khoảng"
// radio and the "có đào tạo nhóm ngành" filter both need per-program data that a
// pre-baked SchoolRow[] doesn't carry — so this page never calls BE's
// /api/v1/schools; there was never a fetchSchoolRows() to wire up here.
//
// `await searchParams` opts the route into dynamic rendering (so useSearchParams
// resolves during SSR); <Suspense> is required by the production build wherever
// useSearchParams is used.
export default async function TruongPage({
  searchParams,
}: PageProps<"/truong">) {
  await searchParams;
  const rows = await fetchMajorRows();

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Tra cứu học phí theo trường
        </h1>
        <ViewModeToggle current="truong" />
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <SchoolResultsView rows={rows} />
      </Suspense>
      <CommentSection
        threadKey="truong"
        title="Thảo luận chung: học phí theo trường"
        subtitle="Hỏi đáp chung về học phí các trường. Không cần đăng nhập. Bình luận là ý kiến cá nhân, không phải số liệu đã kiểm chứng."
        className="max-w-3xl"
      />
    </main>
  );
}
