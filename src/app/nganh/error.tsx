"use client"; // error boundaries must be Client Components

// Next renders this when app/nganh/page.tsx (or anything it renders) throws while
// rendering — e.g. fetchMajorRows() got a non-OK response or the dev server is
// down. `retry` re-renders the route segment (Next 16 renamed it from `reset`).
export default function NganhError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-16 text-center">
      <p className="text-ink">
        Không tải được dữ liệu ngành. Thử lại sau ít phút.
      </p>
      <p className="mt-1 text-sm text-ink-3">{error.message}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-ink hover:bg-surface-2"
      >
        Thử lại
      </button>
    </main>
  );
}
