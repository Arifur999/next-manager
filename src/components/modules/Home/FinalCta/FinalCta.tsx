import { FINAL_CTA } from "@/data/home/finalCta"
import { SIGN_IN, getCtaMicrocopy, getPrimaryCta } from "@/data/site"
import Link from "next/link"
import CtaLink from "../Shell/CtaLink"
import SectionShell from "../Shell/SectionShell"

// The closing band, in ink. Same label as the header and hero CTAs.
const FinalCta = ({ trialDays }: { trialDays: number | null }) => {
  const cta = getPrimaryCta(trialDays)

  return (
    <SectionShell labelledBy="final-cta-title" variant="full-bleed">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h2 id="final-cta-title" className="max-w-[22ch] text-display">
            {FINAL_CTA.title}
          </h2>
          <p className="mt-5 max-w-[56ch] text-lg text-band-foreground/75">{FINAL_CTA.body}</p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <CtaLink href={cta.href} tone="inverse" size="lg" className="focus-visible:outline-band-foreground">
            {cta.label}
          </CtaLink>
          <p className="mt-3 text-sm text-band-foreground/75">{getCtaMicrocopy(trialDays)}</p>
          <p className="mt-6 text-sm text-band-foreground/75">
            {FINAL_CTA.signInPrompt}{" "}
            <Link
              href={SIGN_IN.href}
              className="font-medium text-band-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-foreground"
            >
              {SIGN_IN.label}
            </Link>
          </p>
        </div>
      </div>
    </SectionShell>
  )
}

export default FinalCta
