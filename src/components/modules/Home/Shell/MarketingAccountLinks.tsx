"use client"

import { getDashboardHomeAction } from "@/app/(commonLayout)/(marketing)/_action"
import { SIGN_IN } from "@/data/site"
import Link from "next/link"
import { useEffect, useState } from "react"
import CtaLink from "./CtaLink"

interface IMarketingAccountLinksProps {
  cta: { label: string; href: string }
}

// "Sign in" and the primary CTA, or "Open your dashboard" for somebody already
// signed in. The page is rendered once for everyone, so the session is asked
// for after it loads; until then, and if that fails, the signed-out links show.
const MarketingAccountLinks = ({ cta }: IMarketingAccountLinksProps) => {
  const [dashboardHref, setDashboardHref] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true
    getDashboardHomeAction().then(
      (home) => {
        if (isCurrent) setDashboardHref(home)
      },
      // The signed-out links still work, so a failed check changes nothing.
      () => undefined,
    )
    return () => {
      isCurrent = false
    }
  }, [])

  if (dashboardHref) {
    return (
      <CtaLink href={dashboardHref} size="sm" className="sm:h-10 sm:px-4">
        Open your dashboard
      </CtaLink>
    )
  }

  return (
    <>
      <Link
        href={SIGN_IN.href}
        className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-ring sm:inline-flex"
      >
        {SIGN_IN.label}
      </Link>
      {/* Compact on phones, beside the menu button; hidden below 360px, where
          it would push the header wider than the screen. */}
      <CtaLink href={cta.href} size="sm" className="max-[360px]:hidden sm:h-10 sm:px-4">
        {cta.label}
      </CtaLink>
    </>
  )
}

export default MarketingAccountLinks
