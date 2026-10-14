// Server Component — renders one JSON-LD <script> for structured data.
// Search engines and generative engines read this to understand the page as
// data (Organization, WebSite, FAQPage, …). See ../mockup/SEO-GEO-AIO.md §4.
//
// `dangerouslySetInnerHTML` is the standard way to inline JSON-LD in React; the
// value is our own object, serialised with JSON.stringify. JSON.stringify does NOT
// escape "<", so a string containing "</script>" (e.g. a post title) could close the
// tag early; replacing "<" with its unicode escape keeps the JSON identical for
// parsers but makes that impossible (Next's JSON-LD guide recommends the same).

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
