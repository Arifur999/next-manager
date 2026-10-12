import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

type CtaTone = "primary" | "quiet" | "inverse"

interface ICtaLinkProps {
  href: string
  tone?: CtaTone
  size?: "md" | "lg"
  className?: string
  children: ReactNode
}

// The marketing call to action, built on tokens rather than the app's Button so
// its size and weight can follow the page instead of a form.
const TONES: Record<CtaTone, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  quiet: "border border-input bg-card text-foreground hover:bg-muted",
  inverse: "bg-band-foreground text-band hover:bg-band-foreground/90",
}

const SIZES = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const

const CtaLink = ({ href, tone = "primary", size = "md", className, children }: ICtaLinkProps) => (
  <Link
    href={href}
    className={cn(
      "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap",
      "transition-colors duration-(--duration-fast) ease-out-quart",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      TONES[tone],
      SIZES[size],
      className,
    )}
  >
    {children}
  </Link>
)

export default CtaLink
