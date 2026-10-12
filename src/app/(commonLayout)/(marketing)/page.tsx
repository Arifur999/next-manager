import Faq from "@/components/modules/Home/Faq/Faq"
import FinalCta from "@/components/modules/Home/FinalCta/FinalCta"
import Features from "@/components/modules/Home/Features/Features"
import Hero from "@/components/modules/Home/Hero/Hero"
import LedgerTrace from "@/components/modules/Home/LedgerTrace/LedgerTrace"
import ModuleBand from "@/components/modules/Home/ModuleBand/ModuleBand"
import PricingTeaser from "@/components/modules/Home/Pricing/PricingTeaser"
import Problem from "@/components/modules/Home/Problem/Problem"
import Roles from "@/components/modules/Home/Roles/Roles"
import Workflow from "@/components/modules/Home/Workflow/Workflow"
import StructuredData from "@/components/shared/StructuredData"
import { FAQ_ITEMS } from "@/data/home/faq"
import { PRICING } from "@/data/home/pricing"
import { homeJsonLd } from "@/data/schema"
import { site } from "@/data/site"
import { getSiteUrl } from "@/lib/siteUrl"
import { getPublicPlans } from "@/services/publicPlans.services"
import type { Metadata } from "next"
import { signupTrialDays } from "@/zod/publicPlans.validation"

export const metadata: Metadata = {
  title: { absolute: `${site.name}: clients, projects, time and invoices in one ledger` },
  description:
    "Run leads, projects, timesheets, invoices, payments and payroll in one workspace, with USD and BDT accounts, four roles and a per-person permission grid.",
  alternates: { canonical: "/" },
}

// Composes the landing sections in page order. Copy lives in src/data/home.
const HomePage = async () => {
  const allPlans = await getPublicPlans()
  const trialDays = signupTrialDays(allPlans)
  // The same plans feed the visible teaser and the JSON-LD offers.
  const plans = allPlans.slice(0, PRICING.maxPlans)

  return (
    <>
      <StructuredData data={homeJsonLd({ site, url: getSiteUrl(), plans, faq: FAQ_ITEMS })} />
      <Hero trialDays={trialDays} />
      <LedgerTrace />
      <Problem />
      <ModuleBand />
      <Features />
      <Workflow />
      <Roles />
      {plans.length > 0 && <PricingTeaser plans={plans} />}
      <Faq />
      <FinalCta trialDays={trialDays} />
    </>
  )
}

export default HomePage
