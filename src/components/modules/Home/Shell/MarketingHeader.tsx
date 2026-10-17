import { SIGN_IN, type INavLink } from "@/data/site"
import Link from "next/link"
import CtaLink from "./CtaLink"
import MarketingNav from "./MarketingNav"
import MobileMarketingNav from "./MobileMarketingNav"
import Wordmark from "./Wordmark"

interface IMarketingHeaderProps {
  links: INavLink[]
  cta: { label: string; href: string }
}

const MarketingHeader = ({ links, cta }: IMarketingHeaderProps) => (
  <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
    <div className="mx-auto flex h-16 w-full max-w-content items-center gap-6 px-4 sm:px-6 lg:px-8">
      <Wordmark compact />
      <div className="ml-auto flex items-center gap-2 lg:ml-6 lg:flex-1 lg:justify-between">
        <MarketingNav links={links} />
        <div className="flex items-center gap-2">
          <Link
            href={SIGN_IN.href}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-ring sm:inline-flex"
          >
            {SIGN_IN.label}
          </Link>
          {/* Compact on phones, beside the menu button; hidden below 360px, where
              it would push the header wider than the screen. */}
          <CtaLink href={cta.href} size="sm" className="max-[359px]:hidden sm:h-10 sm:px-4">
            {cta.label}
          </CtaLink>
          <MobileMarketingNav links={links} cta={cta} />
        </div>
      </div>
    </div>
  </header>
)

export default MarketingHeader
