import type { ReactNode } from "react"

/**
 * A value somebody can see but not change, such as the email an invite is
 * bound to. Shown as text with the reason under it: a disabled input greys the
 * value out until it reads like an empty field's placeholder.
 */
const ReadOnlyField = ({ label, value, reason }: { label: string; value: ReactNode; reason: string }) => (
  <dl className="space-y-1.5">
    <dt className="text-sm leading-none font-medium">{label}</dt>
    <dd className="flex min-h-9 items-center text-sm break-all text-foreground">{value}</dd>
    <dd className="text-xs text-muted-foreground">{reason}</dd>
  </dl>
)

export default ReadOnlyField
