"use client"

import { getLoadedGsap } from "@/lib/gsap"
import { useEffect } from "react"

// Refreshes ScrollTrigger when the page height changes (streamed sections, an
// opened FAQ answer) and once fonts have loaded. The height check stops loops.
// It never loads GSAP itself: until a section has, there is nothing to refresh.
export function ScrollTriggerAutoRefresh({ delay = 200 }: { delay?: number }) {
  useEffect(() => {
    const refresh = () => getLoadedGsap()?.ScrollTrigger.refresh()
    let last = document.body.scrollHeight
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new ResizeObserver(() => {
      const height = document.body.scrollHeight
      if (Math.abs(height - last) < 2) return
      last = height
      clearTimeout(timer)
      timer = setTimeout(refresh, delay)
    })
    observer.observe(document.body)
    document.fonts.ready.then(refresh)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [delay])
  return null
}
