// Server Component — inline SVG (không dùng next/image) nên icon ăn màu theme
// qua các class Tailwind fill-accent / fill-accent-bg / fill-accent-strong
// (map từ --accent, --accent-bg, --accent-strong trong globals.css). Không tốn
// thêm HTTP request. Concept: vòng kính lúp bao mũ cử nhân.
export default function Logo({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 92 92"
      className={className}
      role="img"
      aria-label="hocphi.info"
    >
      <rect
        x="57"
        y="47"
        width="9"
        height="32"
        rx="5"
        transform="rotate(45 61.5 63)"
        className="fill-accent"
      />
      <circle
        cx="36"
        cy="36"
        r="29.5"
        strokeWidth={5}
        className="fill-accent-bg stroke-accent"
      />
      <rect
        x="22"
        y="18"
        width="28"
        height="28"
        rx="3"
        transform="rotate(45 36 32)"
        className="fill-accent-strong"
      />
      <rect
        x="29"
        y="54"
        width="14"
        height="7"
        rx="2"
        className="fill-accent-strong"
      />
    </svg>
  );
}
