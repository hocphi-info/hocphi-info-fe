// Next hiển thị file này trong khi app/du-lieu/page.tsx đang await fetchCoverage()
// (bọc page trong <Suspense> phía sau — không cần spinner tự viết). Khung khớp
// nganh/loading.tsx: 1 tiêu đề + lưới 4 ô thống kê + 1 khối bảng.
export default function Loading() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-8">
      <div className="h-9 w-80 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
      <div className="mt-8 h-72 animate-pulse rounded-xl bg-surface-2" />
    </main>
  );
}
