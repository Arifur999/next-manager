"use client"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { SIGN_IN, type INavLink } from "@/data/site"
import Link from "next/link"
import type { RefObject } from "react"
import CtaLink from "./CtaLink"

interface IMobileNavSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  links: INavLink[]
  cta: { label: string; href: string }
  /** The menu button: there is no SheetTrigger, so focus goes back to it by hand. */
  returnFocusTo: RefObject<HTMLButtonElement | null>
}

// The menu panel. Loaded on demand by MobileMarketingNav, so Radix Dialog and
// its focus and scroll locking are not part of the landing page's first load.
const MobileNavSheet = ({ open, onOpenChange, links, cta, returnFocusTo }: IMobileNavSheetProps) => {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm gap-0 p-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocusTo.current?.focus()
        }}
      >
        <SheetTitle className="px-6 pt-6 text-base">Menu</SheetTitle>
        <SheetDescription className="sr-only">Sections of the page and account links</SheetDescription>
        <nav aria-label="Main" className="px-3 pt-4">
          <ul className="divide-y">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="flex min-h-12 items-center px-3 text-base">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto grid gap-3 border-t p-6">
          <CtaLink href={cta.href} size="lg" className="w-full">
            {cta.label}
          </CtaLink>
          <Link href={SIGN_IN.href} onClick={close} className="py-2 text-center text-sm text-primary-strong underline-offset-4 hover:underline">
            {SIGN_IN.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNavSheet
