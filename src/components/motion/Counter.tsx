"use client"

import { MQ } from "@/lib/motion"
import { useRef } from "react"
import { useLazyGsap } from "./useLazyGsap"

// The final value is in the server HTML and in an sr-only copy; the visible
// count runs once on scroll, and not at all with reduced motion.
export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const final = String(to)

  useLazyGsap(
    ref,
    ({ gsap, mm }, el) => {
      mm.add(MQ.motionOK, () => {
        const state = { value: 0 }
        const render = () => {
          el.textContent = String(Math.round(state.value))
        }
        render()
        gsap.to(state, {
          value: to,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: render,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        })
        return () => {
          el.textContent = final
        }
      })
    },
    [to, final],
  )

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {final}
      </span>
    </span>
  )
}
