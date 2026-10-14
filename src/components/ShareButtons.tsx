import CopyLinkButton from "@/components/CopyLinkButton";
import { facebookShareUrl, threadsShareUrl } from "@/lib/posts";

// Server Component. Facebook và Threads là thẻ <a> thuần (không cần JS); chỉ nút
// "Sao chép link" là Client Component. `url` luôn là URL canonical sạch (không UTM).
const BTN =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-accent-border hover:bg-surface-2";
const BTN_PRIMARY =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-accent bg-accent px-3 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90";

export default function ShareButtons({
  url,
  title,
  vertical = false,
}: {
  url: string;
  title: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={
        vertical ? "flex flex-col items-stretch gap-2" : "flex flex-wrap gap-2"
      }
    >
      <a
        href={facebookShareUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="share-facebook"
        className={BTN_PRIMARY}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.6-1.5H18V.2C17.6.1 16.3 0 15 0c-2.8 0-4.5 1.7-4.5 4.7V6H8v3h2.5v9H14V9Z" />
        </svg>
        Facebook
      </a>
      <a
        href={threadsShareUrl(url, title)}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="share-threads"
        className={BTN}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 21c-5 0-8-3.4-8-9s3-9 8-9c3.6 0 6 1.7 7.2 4.4" />
          <path d="M8.5 13c0-2 1.6-3.3 3.6-3.3 2.4 0 3.7 1.6 3.7 4.1 0 3-1.9 4.7-4.5 4.7-1.8 0-3-.9-3-2.3 0-1.7 1.8-2.5 4.4-2.5 3.2 0 5.2.8 5.2 2.3" />
        </svg>
        Threads
      </a>
      <CopyLinkButton url={url} className={BTN} />
    </div>
  );
}
