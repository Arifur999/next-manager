import { site } from "@/data/site"
import { cn } from "@/lib/utils"
import Link from "next/link"

// The name set in type. There is no logo, so none is drawn.
const Wordmark = ({ className, inverse = false }: { className?: string; inverse?: boolean }) => (
  <Link
    href="/"
    className={cn(
      "inline-flex items-baseline gap-2 rounded-sm text-base leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
      className,
    )}
  >
    <span className="font-semibold tracking-tight">{site.shortName}</span>
    <span aria-hidden="true" className={cn("h-3.5 w-px self-center", inverse ? "bg-band-foreground/30" : "bg-border")} />
    <span className={cn("font-normal", inverse ? "text-band-foreground/70" : "text-muted-foreground")}>Management</span>
    <span className="sr-only">, home</span>
  </Link>
)

export default Wordmark
