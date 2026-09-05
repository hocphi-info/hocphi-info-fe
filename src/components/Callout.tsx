// Server Component — a static note box. Distinct from DismissibleCallout (that
// one is a Client Component with a close button). Two tones:
//   - "info"  neutral, on surface-2
//   - "warn"  amber, for caveats / "read this before trusting the number"
// Matches the callouts in ../mockup/Method.dc.html and Data.dc.html.

export default function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn";
  title?: string;
  children: React.ReactNode;
}) {
  const box =
    tone === "warn"
      ? "border-warn-bg bg-warn-bg text-warn-ink"
      : "border-border bg-surface-2 text-ink-2";

  return (
    <aside
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${box}`}
    >
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </aside>
  );
}
