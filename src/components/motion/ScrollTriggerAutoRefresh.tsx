"use client"

import { ScrollTrigger } from "@/lib/gsap"
import { useEffect } from "react"

// Refreshes ScrollTrigger when the page height changes (streamed sections, an
// opened FAQ answer) and once fonts have loaded. The height check stops loops.
export function ScrollTriggerAutoRefresh({ delay = 200 }: { delay?: number }) {
  useEffect(() => {
    let last = document.body.scrollHeight
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new ResizeObserver(() => {
      const height = document.body.scrollHeight
      if (Math.abs(height - last) < 2) return
      last = height
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), delay)
    })
    observer.observe(document.body)
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [delay])
  return null
}
