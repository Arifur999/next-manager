import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type SectionVariant = "contained" | "full-bleed" | "dense"

interface ISectionShellProps {
  id?: string
  labelledBy?: string
  variant?: SectionVariant
  className?: string
  innerClassName?: string
  children: ReactNode
}

// One rhythm for every landing section. Variants change the padding and the
// surface so consecutive sections do not all breathe the same way.
const OUTER: Record<SectionVariant, string> = {
  contained: "py-16 md:py-24",
  dense: "py-12 md:py-16",
  "full-bleed": "py-16 md:py-24 bg-band text-band-foreground",
}

const SectionShell = ({ id, labelledBy, variant = "contained", className, innerClassName, children }: ISectionShellProps) => (
  <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-20", OUTER[variant], className)}>
    <div className={cn("mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8", innerClassName)}>{children}</div>
  </section>
)

export default SectionShell
