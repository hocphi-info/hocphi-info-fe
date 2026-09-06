"use client"; // error boundaries must be Client Components

import RouteError from "@/components/RouteError";

// See app/nganh/error.tsx.
export default function TruongError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      message="Không tải được dữ liệu trường. Thử lại sau ít phút."
      wide
      {...props}
    />
  );
}
