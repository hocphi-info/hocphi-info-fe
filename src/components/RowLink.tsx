import Link from "next/link";

// Server Component — the per-row "open detail" link. It renders the small `›`
// chevron in the last cell AND a stretched overlay (`after:absolute
// after:inset-0`) that makes the WHOLE <tr> clickable. For the overlay to size
// itself to the row, the parent <tr> must be `position: relative` (see
// MajorResultsTable) — that is the CSS "containing block", like a Flutter Stack
// with a Positioned.fill child.
//
// Week 4: the detail route (S3/S4) does not exist yet, so `href` is "#". We pass
// `scroll={false}` so a stray click does not jump the page to the top. When the
// route lands, change `href` to the real path and (optionally) add a hover
// treatment on the <tr> in MajorResultsTable.
export default function RowLink({ label }: { label: string }) {
  return (
    <Link
      href="#"
      scroll={false}
      aria-label={`Xem chi tiết ${label}`}
      className="text-ink-3 after:absolute after:inset-0 after:content-[''] hover:text-accent"
    >
      ›
    </Link>
  );
}
