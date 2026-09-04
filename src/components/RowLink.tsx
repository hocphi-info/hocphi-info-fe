import Link from "next/link";

// Server Component — the per-row "open detail" link. Only this chevron is
// clickable (not the whole <tr>), so row text stays selectable/copyable. The
// link fills the whole last cell (flex + px-4 py-3, cell has p-0) so the hit
// target is ~48×44px instead of just the glyph — easier to click without
// making the row clickable. `hover:bg-surface-2` marks it as a button.
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
      className="flex items-center justify-center px-4 py-3 text-2xl leading-none text-ink-3 hover:bg-surface-2 hover:text-accent"
    >
      ›
    </Link>
  );
}
