import type { INavLink } from "@/data/site"
import MarketingAccountLinks from "./MarketingAccountLinks"
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
          <MarketingAccountLinks cta={cta} />
          <MobileMarketingNav links={links} cta={cta} />
        </div>
      </div>
    </div>
  </header>
)

export default MarketingHeader
