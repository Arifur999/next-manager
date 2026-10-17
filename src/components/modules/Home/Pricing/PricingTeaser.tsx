import { PRICING, featureName, isStartingPlan } from "@/data/home/pricing"
import { getCtaMicrocopy, getPrimaryCta } from "@/data/site"
import { formatUsd } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { PublicPlan } from "@/zod/publicPlans.validation"
import CtaLink from "../Shell/CtaLink"
import SectionShell from "../Shell/SectionShell"

const limitText = (value: number | null, noun: string) =>
  value === null ? `${PRICING.unlimited} ${noun}s` : `${value} ${value === 1 ? noun : `${noun}s`}`

const priceText = (price: number) => (price === 0 ? PRICING.free : formatUsd(price, { compact: Number.isInteger(price) }))

// Renders only real plans from the API (the page passes at most PRICING.maxPlans). The caller skips the section entirely
// when there are none, so nothing here is ever a placeholder price.
const PricingTeaser = ({ plans, trialDays }: { plans: PublicPlan[]; trialDays: number | null }) => {
  const cta = getPrimaryCta(trialDays)

  return (
    <SectionShell id="pricing" labelledBy="pricing-title" className="border-b bg-muted/50">
      <div className="max-w-2xl">
        <h2 id="pricing-title" className="text-display">
          {PRICING.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{PRICING.body}</p>
      </div>

      <ul className={cn("mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2", plans.length > 2 && "lg:grid-cols-4")}>
        {plans.map((plan) => {
          const startsHere = isStartingPlan(plan)
          return (
            <li
              key={plan.code}
              className={cn("flex flex-col p-6", startsHere ? "bg-card ring-2 ring-primary ring-inset" : "bg-background")}
            >
              <h3 className="text-title">{plan.name}</h3>
              {startsHere && <p className="mt-1 text-sm font-medium text-primary-strong">{PRICING.startsHere}</p>}
              <p className="mt-5">
                <span className="text-display font-medium tabular-nums">{priceText(plan.price)}</span>
                {plan.price > 0 && <span className="ml-1 text-sm text-muted-foreground">per month</span>}
              </p>
              <ul className="mt-5 space-y-1.5 border-t pt-5 text-sm">
                <li>{limitText(plan.max_seats, "seat")}</li>
                <li>{limitText(plan.max_projects, "project")}</li>
                {plan.features.slice(0, PRICING.maxFeatures).map((feature) => (
                  <li key={feature} className="text-muted-foreground">
                    {featureName(feature)}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <CtaLink href={cta.href} size="lg">
          {cta.label}
        </CtaLink>
        <p className="text-sm text-muted-foreground">{getCtaMicrocopy(trialDays)}</p>
      </div>
    </SectionShell>
  )
}

export default PricingTeaser
