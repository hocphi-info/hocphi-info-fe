import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex flex-1 max-w-3xl flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tra cứu & so sánh học phí đại học
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ước lượng tổng chi phí học phí cả khoá theo trường và ngành — minh
          bạch nguồn dữ liệu.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/nganh"
          className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Tra cứu theo ngành
        </Link>
        <Link
          href="/truong"
          className="rounded-full border border-zinc-300 px-6 py-3 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Tra cứu theo trường
        </Link>
      </div>
    </main>
  );
}
