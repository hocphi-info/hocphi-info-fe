"use client"; // error boundaries must be Client Components

export default function ProgramDetailError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-16 text-center">
      <p className="text-ink">
        Không tải được chi tiết ngành này. Thử lại sau ít phút.
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
