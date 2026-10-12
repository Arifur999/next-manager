import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCw, TriangleAlert } from "lucide-react"

/**
 * A section that failed to load, said plainly, with a way to try again. Scoped
 * to the panel it replaces, so the rest of the page stays usable. Never shown
 * as an empty state: "no rows" and "the rows did not arrive" are different.
 */
const ErrorState = ({
  message = "This list did not load.",
  onRetry,
  isRetrying = false,
  className,
}: {
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}) => (
  <div role="alert" className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
    <TriangleAlert aria-hidden="true" className="size-6 text-destructive" />
    <p className="text-sm font-medium">{message}</p>
    {onRetry && (
      <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
        <RotateCw aria-hidden="true" className={cn("size-3.5", isRetrying && "animate-spin")} />
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    )}
  </div>
)

export default ErrorState
