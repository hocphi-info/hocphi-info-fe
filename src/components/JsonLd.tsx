// Server Component — renders one JSON-LD <script> for structured data.
// Search engines and generative engines read this to understand the page as
// data (Organization, WebSite, FAQPage, …). See ../mockup/SEO-GEO-AIO.md §4.
//
// `dangerouslySetInnerHTML` is the standard way to inline JSON-LD in React; the
// value is our own object (never user input), serialised with JSON.stringify,
// so there is no injection surface here.

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
