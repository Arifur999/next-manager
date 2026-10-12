"use client"

import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SIGN_IN, type INavLink } from "@/data/site"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import CtaLink from "./CtaLink"

interface IMobileMarketingNavProps {
  links: INavLink[]
  cta: { label: string; href: string }
}

const MobileMarketingNav = ({ links, cta }: IMobileMarketingNavProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm gap-0 p-0">
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

export default MobileMarketingNav
