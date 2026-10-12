// Renders JSON-LD. dangerouslySetInnerHTML is safe here only because the data
// is built from local constants and the zod-parsed plans endpoint; "<" is
// escaped so no value can close the script tag.
const StructuredData = ({ data }: { data: Record<string, unknown>[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
  />
)

export default StructuredData
