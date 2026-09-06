"use client"; // error boundaries must be Client Components

import RouteError from "@/components/RouteError";

export default function CompareError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      message="Không tải được trang so sánh. Thử lại sau ít phút."
      {...props}
    />
  );
}
