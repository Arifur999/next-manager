import Features from "@/components/modules/Home/Features/Features"
import Hero from "@/components/modules/Home/Hero/Hero"
import LedgerTrace from "@/components/modules/Home/LedgerTrace/LedgerTrace"
import ModuleBand from "@/components/modules/Home/ModuleBand/ModuleBand"
import PricingTeaser from "@/components/modules/Home/Pricing/PricingTeaser"
import Problem from "@/components/modules/Home/Problem/Problem"
import Roles from "@/components/modules/Home/Roles/Roles"
import Workflow from "@/components/modules/Home/Workflow/Workflow"
import { getPublicPlans } from "@/services/publicPlans.services"
import { signupTrialDays } from "@/zod/publicPlans.validation"

// Composes the landing sections in page order. Copy lives in src/data/home.
const HomePage = async () => {
  const plans = await getPublicPlans()
  const trialDays = signupTrialDays(plans)

  return (
    <>
      <Hero trialDays={trialDays} />
      <LedgerTrace />
      <Problem />
      <ModuleBand />
      <Features />
      <Workflow />
      <Roles />
      {plans.length > 0 && <PricingTeaser plans={plans} />}
    </>
  )
}

export default HomePage
