"use client"

import { DEV_MARKERS, gsap, SplitText, useGSAP } from "@/lib/gsap"
import { MQ } from "@/lib/motion"
import { useRef, type ReactNode } from "react"

// Masked word reveal for one heading. The heading stays real server HTML passed
// as children; SplitText's aria handling reads it once as whole words.
// Reduced motion: no split at all.
export function SplitReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add(MQ.reduce, () => {
        gsap.set(root, { autoAlpha: 1 })
      })

      mm.add(MQ.motionOK, () => {
        SplitText.create(root.children, {
          type: "words,lines",
          mask: "words",
          autoSplit: true,
          onSplit(self) {
            gsap.set(root, { autoAlpha: 1 })
            // Returned so SplitText reverts and rebuilds it when lines re-flow.
            return gsap.from(self.words, {
              yPercent: 110,
              duration: 0.5,
              stagger: 0.05,
              scrollTrigger: { trigger: root, start: "top 85%", once: true, markers: DEV_MARKERS },
            })
          },
        })
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
