import { ScrollTriggerAutoRefresh } from "@/components/motion/ScrollTriggerAutoRefresh"
import MarketingFooter from "@/components/modules/Home/Shell/MarketingFooter"
import MarketingHeader from "@/components/modules/Home/Shell/MarketingHeader"
import { MARKETING_NAV, getPrimaryCta } from "@/data/site"
import { getPublicPlans } from "@/services/publicPlans.services"
import { signupTrialDays } from "@/zod/publicPlans.validation"
import type { ReactNode } from "react"

const MarketingLayout = async ({ children }: { children: ReactNode }) => {
  const plans = await getPublicPlans()
  // The Pricing link only appears when there are real plans to show.
  const links = plans.length > 0 ? MARKETING_NAV : MARKETING_NAV.filter((link) => link.href !== "/#pricing")
  const cta = getPrimaryCta(signupTrialDays(plans))

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader links={links} cta={cta} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <MarketingFooter links={links} cta={cta} />
      <ScrollTriggerAutoRefresh />
    </div>
  )
}

export default MarketingLayout
