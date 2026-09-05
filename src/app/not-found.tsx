import Link from "next/link";

// Next renders this when `notFound()` is called anywhere in the tree, or when
// a segment doesn't match any route. First use in this codebase (Week 4) —
// fetchProgramDetail/fetchSchoolDetail (lib/api.ts) call notFound() for ANY
// invalid school/major slug (school doesn't exist, major doesn't exist, or
// the pair just doesn't match a seeded program) — one 404, no soft-empty state.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-16 text-center">
      <p className="text-ink">Không tìm thấy trang này.</p>
      <p className="mt-1 text-sm text-ink-3">
        Trường hoặc ngành có thể chưa có dữ liệu, hoặc đường dẫn không đúng.
      </p>
      <Link
        href="/nganh"
        className="mt-4 inline-block rounded-lg border border-border px-4 py-2 text-sm text-ink hover:bg-surface-2"
      >
        Về trang tra cứu
      </Link>
    </main>
  );
}
