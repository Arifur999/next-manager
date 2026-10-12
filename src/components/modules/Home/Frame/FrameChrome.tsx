import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface IFrameChromeProps {
  title: string
  /** What the frame shows, for screen readers and as a visible caption. */
  label: string
  className?: string
  children: ReactNode
}

// A product frame: the app's own surfaces and type, raised off the page with
// the one shadow the direction allows. Marked as sample data, never a screenshot
// of a customer.
const FrameChrome = ({ title, label, className, children }: IFrameChromeProps) => (
  <figure className={cn("min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-frame", className)}>
    <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-4 py-2.5">
      <p className="truncate text-xs font-medium">{title}</p>
      <p className="shrink-0 rounded-sm border bg-card px-1.5 py-0.5 text-[0.6875rem] leading-none text-muted-foreground">Sample data</p>
    </div>
    <div className="font-condensed">{children}</div>
    <figcaption className="sr-only">{label}</figcaption>
  </figure>
)

export default FrameChrome
