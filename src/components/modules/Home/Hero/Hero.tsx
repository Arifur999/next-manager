import { getCtaMicrocopy, getPrimaryCta } from "@/data/site"
import { HERO } from "@/data/home/hero"
import Link from "next/link"
import { MarkerNotes } from "../Frame/MarkerNote"
import CtaLink from "../Shell/CtaLink"
import ProductFrame from "./ProductFrame"

// Static on purpose: the h1 is the LCP element and the frame sits beside it, so
// neither waits for JavaScript or animates in.
const Hero = ({ trialDays }: { trialDays: number | null }) => {
  const cta = getPrimaryCta(trialDays)

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip border-b">
      <div className="mx-auto grid w-full max-w-content gap-10 px-4 pt-12 pb-14 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-24 lg:pb-24">
        <div className="lg:col-span-7 lg:pr-8">
          <h1 id="hero-title" className="max-w-[16ch] text-display-lg font-medium text-balance">
            {HERO.title}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">{HERO.subhead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink href={cta.href} size="lg">
              {cta.label}
            </CtaLink>
            <Link
              href={HERO.secondary.href}
              className="rounded-sm text-base font-medium text-primary-strong underline decoration-primary-strong/30 underline-offset-4 hover:decoration-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {HERO.secondary.label}
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{getCtaMicrocopy(trialDays)}</p>
        </div>

        <div className="min-w-0 lg:col-span-5 xl:-mr-6">
          <ProductFrame />
          <MarkerNotes className="mt-5 max-w-md" notes={[HERO.notes.currencies, HERO.notes.hours]} />
        </div>
      </div>
    </section>
  )
}

export default Hero
