"use client"; // error boundaries must be Client Components

import RouteError from "@/components/RouteError";

// Next renders this when app/nganh/page.tsx (or anything it renders) throws while
// rendering — e.g. fetchMajorRows() got a non-OK response or the API is down.
// `retry` re-renders the route segment (Next 16 renamed it from `reset`).
// Body + digest handling live in the shared <RouteError>.
export default function NganhError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      message="Không tải được dữ liệu ngành. Thử lại sau ít phút."
      wide
      {...props}
    />
  );
}
