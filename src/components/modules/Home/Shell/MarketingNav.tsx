import type { INavLink } from "@/data/site"
import Link from "next/link"

const MarketingNav = ({ links }: { links: INavLink[] }) => (
  <nav aria-label="Main" className="hidden lg:block">
    <ul className="flex items-center gap-1">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)

export default MarketingNav
