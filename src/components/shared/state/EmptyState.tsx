import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/**
 * "There is nothing here yet", said the same way everywhere.
 *
 * This shape was written out sixteen times before it became a component, and
 * the copies had already started to differ — some at py-12, some at py-10, one
 * with a differently sized icon. An empty list is the state a screen is in most
 * often when somebody is new, so it is the last place inconsistency should
 * show.
 *
 * `hint` is for the sentence that says what to do about it. An empty state that
 * only reports emptiness leaves the reader where it found them.
 */
const EmptyState = ({
  icon: Icon,
  children,
  hint,
  className = "",
}: {
  icon: LucideIcon
  children: ReactNode
  hint?: ReactNode
  className?: string
}) => (
  <div
    className={`flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground ${className}`}
  >
    <Icon className="size-7" aria-hidden="true" />
    <p>{children}</p>
    {hint && <p className="max-w-md text-xs">{hint}</p>}
  </div>
)

export default EmptyState
