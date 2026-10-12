"use client"

import type { GsapKit } from "@/lib/gsap"
import { MQ } from "@/lib/motion"
import { Pause, Play } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"
import { useLazyGsap } from "./useLazyGsap"

type MarqueeProps = {
  /** <li> items. Rendered twice; the copy is aria-hidden and inert. */
  children: ReactNode
  label: string
  /** Seconds for one full loop. */
  duration?: number
}

const GROUP = "flex shrink-0 items-center gap-2 pr-2 motion-reduce:shrink motion-reduce:flex-wrap [@media(scripting:none)]:shrink [@media(scripting:none)]:flex-wrap"

// A slow two-group loop. Pauses on hover, on focus, offscreen and by the
// visible button (WCAG 2.2.2). Reduced motion and no-JS get the static,
// wrapped list with no copy.
export function Marquee({ children, label, duration = 60 }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const loop = useRef<ReturnType<GsapKit["gsap"]["to"]> | null>(null)
  const userPaused = useRef(false)
  const [paused, setPaused] = useState(false)

  useLazyGsap(
    root,
    ({ gsap, ScrollTrigger, mm }, el) => {
      mm.add(MQ.motionOK, () => {
        const groups = gsap.utils.toArray<HTMLElement>("[data-marquee-group]", el)
        const tween = gsap.fromTo(groups, { xPercent: 0 }, { xPercent: -100, duration, ease: "none", repeat: -1 })
        loop.current = tween
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle(self) {
            if (userPaused.current) return
            if (self.isActive) tween.play()
            else tween.pause()
          },
        })
        return () => {
          loop.current = null
        }
      })
    },
    [duration],
  )

  // Pausing and playing an existing tween creates nothing, so these handlers
  // need no contextSafe wrapper.
  const hold = () => loop.current?.pause()
  const release = () => {
    if (!userPaused.current) loop.current?.play()
  }
  const toggle = () => {
    const tween = loop.current
    if (!tween) return
    userPaused.current = !userPaused.current
    if (userPaused.current) tween.pause()
    else tween.play()
    setPaused(userPaused.current)
  }

  return (
    <div>
      <div
        ref={root}
        role="region"
        aria-label={label}
        className="flex overflow-clip motion-reduce:overflow-visible [@media(scripting:none)]:overflow-visible"
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={release}
      >
        <ul data-marquee-group className={GROUP}>
          {children}
        </ul>
        <ul data-marquee-group className={`${GROUP} motion-reduce:hidden [@media(scripting:none)]:hidden`} aria-hidden="true" inert>
          {children}
        </ul>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring motion-reduce:hidden [@media(scripting:none)]:hidden"
      >
        {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
        {paused ? "Play the module list" : "Pause the module list"}
      </button>
    </div>
  )
}
