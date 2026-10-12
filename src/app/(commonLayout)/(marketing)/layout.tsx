import MarketingFooter from "@/components/modules/Home/Shell/MarketingFooter"
import MarketingHeader from "@/components/modules/Home/Shell/MarketingHeader"
import { MARKETING_NAV, getPrimaryCta } from "@/data/site"
import type { ReactNode } from "react"

const MarketingLayout = ({ children }: { children: ReactNode }) => {
  // Pricing appears only once real plans can be shown (C61 wires the API).
  const links = MARKETING_NAV.filter((link) => link.href !== "/#pricing")
  const cta = getPrimaryCta(null)

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader links={links} cta={cta} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <MarketingFooter links={links} />
    </div>
  )
}

export default MarketingLayout
