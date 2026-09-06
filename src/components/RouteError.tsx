"use client";

// Shared body for every app/**/error.tsx. In production Next redacts a thrown
// server error's `message` (you just get "Minified React error #441"); the
// stable `digest` hash it gives you instead ALSO shows up in `wrangler tail` /
// `fly logs`, so that's the string worth putting on screen — it's the join key
// between "what the user saw" and "the log line".
export default function RouteError({
  message,
  wide = false,
  error,
  retry,
}: {
  message: string;
  wide?: boolean;
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main
      className={`mx-auto ${wide ? "max-w-7xl" : "max-w-4xl"} flex-1 px-4 py-16 text-center`}
    >
      <p className="text-ink">{message}</p>
      <p className="mt-1 text-sm text-ink-3">
        {error.digest ? `Mã lỗi: ${error.digest}` : error.message}
      </p>
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
