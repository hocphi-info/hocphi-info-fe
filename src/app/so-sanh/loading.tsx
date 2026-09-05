import DetailSkeleton from "@/components/DetailSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-6">
      <DetailSkeleton />
    </main>
  );
}
