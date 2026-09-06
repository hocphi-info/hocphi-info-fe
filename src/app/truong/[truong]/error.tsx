"use client"; // error boundaries must be Client Components

import RouteError from "@/components/RouteError";

export default function SchoolDetailError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      message="Không tải được chi tiết trường này. Thử lại sau ít phút."
      {...props}
    />
  );
}
