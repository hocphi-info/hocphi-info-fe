import Link from "next/link";

// Server Component — the per-row "open detail" link. Only this chevron is
// clickable (not the whole <tr>), so row text stays selectable/copyable. The
// chevron is enlarged and given some padding to keep a comfortable hit target.
//
// Week 4: the detail route (S3/S4) does not exist yet, so `href` is "#". We pass
// `scroll={false}` so a stray click does not jump the page to the top. When the
// route lands, change `href` to the real path.
export default function RowLink({ label }: { label: string }) {
  return (
    <Link
      href="#"
      scroll={false}
      aria-label={`Xem chi tiết ${label}`}
      className="inline-flex items-center justify-center px-1 text-2xl leading-none text-ink-3 hover:text-accent"
    >
      ›
    </Link>
  );
}
