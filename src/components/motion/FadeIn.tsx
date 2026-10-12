"use client"

import { DEV_MARKERS, gsap, useGSAP } from "@/lib/gsap"
import { DURATION, MQ } from "@/lib/motion"
import { useRef, type ReactNode } from "react"

type FadeInProps = {
  children: ReactNode
  className?: string
  /** Selector, inside the wrapper, for the items to stagger (default: direct children). */
  items?: string
  /** Reveal travel in px (motion.md: 16). */
  y?: number
  /** > 0 animates direct children in sequence instead of the wrapper. */
  stagger?: number
}

// One-time reveal on scroll. Hidden before hydration only when scripts run
// ([data-reveal] in globals.css); reduced motion shows the final state; focus
// inside finishes the reveal at once, so keyboard users never wait.
export function FadeIn({ children, className, items, y = 16, stagger = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const targets = stagger > 0 ? (items ? gsap.utils.toArray<Element>(items, el) : Array.from(el.children)) : [el]
      const mm = gsap.matchMedia()

      mm.add(MQ.reduce, () => {
        gsap.set([el, ...targets], { autoAlpha: 1 })
      })

      mm.add(MQ.motionOK, () => {
        gsap.set(el, { autoAlpha: 1 })
        // opacity, not autoAlpha: links inside must stay focusable while hidden.
        const tween = gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: DURATION.reveal,
            stagger,
            scrollTrigger: { trigger: el, start: "top 85%", once: true, markers: DEV_MARKERS },
          },
        )
        const finish = () => tween.progress(1)
        el.addEventListener("focusin", finish)
        return () => el.removeEventListener("focusin", finish)
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
