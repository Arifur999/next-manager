"use client"

import type { INavLink } from "@/data/site"
import { Menu } from "lucide-react"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

interface IMobileMarketingNavProps {
  links: INavLink[]
  cta: { label: string; href: string }
}

const loadSheet = () => import("./MobileNavSheet")
const MobileNavSheet = dynamic(loadSheet, { ssr: false })

// Only the menu button ships with the page. The panel (Radix Dialog) is
// fetched when the button is hovered, focused or pressed, and stays mounted
// after the first open so later opens and closes animate as before.
const MobileMarketingNav = ({ links, cta }: IMobileMarketingNavProps) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const preload = () => {
    void loadSheet()
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        className="inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {mounted && <MobileNavSheet open={open} onOpenChange={setOpen} links={links} cta={cta} returnFocusTo={button} />}
    </>
  )
}

export default MobileMarketingNav
