import Link from "next/link"
import type { ReactNode } from "react"

// A KPI tile that opens the list behind its number. The tile's own text names the link.
const TileLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link
    href={href}
    className="block rounded-2xl outline-none transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
  >
    {children}
  </Link>
)

export default TileLink
