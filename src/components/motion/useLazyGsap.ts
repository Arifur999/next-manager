"use client"

import { loadGsap, type GsapKit } from "@/lib/gsap"
import { useEffect, useRef, type DependencyList, type RefObject } from "react"

type MatchMedia = ReturnType<GsapKit["gsap"]["matchMedia"]>

const INTERACTIONS = ["scroll", "keydown", "pointerdown", "touchstart"] as const
let warmupArmed = false

// The first scroll, key or touch anywhere starts the GSAP download, so a fast
// scroll or a Tab run rarely reaches a section before its code has arrived.
// Nothing loads for a visitor who only reads the first screen.
function armWarmup() {
  if (warmupArmed) return
  warmupArmed = true
  const warm = () => {
    for (const type of INTERACTIONS) window.removeEventListener(type, warm)
    loadGsap().catch(() => {})
  }
  for (const type of INTERACTIONS) window.addEventListener(type, warm, { once: true, passive: true })
}

// Shows [data-reveal] content without animation (load failed, or focus got
// there first). Inline opacity wins over the stylesheet's starting state.
function showReveals(el: HTMLElement) {
  const own = el.matches("[data-reveal]") ? [el] : []
  for (const node of [...own, ...el.querySelectorAll<HTMLElement>("[data-reveal]")]) {
    node.style.opacity = "1"
  }
}

/**
 * Runs `setup` once GSAP is loaded, and loads it only when `ref` comes within
 * a quarter screen of the viewport (or on the first interaction), so no animation
 * code is fetched or parsed before the hero paints. Everything `setup`
 * creates goes through the `mm` it is given (a matchMedia scoped to the
 * element) and is reverted on unmount or when `deps` change.
 */
export function useLazyGsap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (kit: GsapKit & { mm: MatchMedia }, el: T) => void,
  deps: DependencyList = [],
) {
  // The latest setup, read when the load resolves, so callers need not memoise it.
  const setupRef = useRef(setup)
  useEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    armWarmup()
    let cancelled = false
    let started = false
    let mm: MatchMedia | null = null

    const start = () => {
      if (started) return
      started = true
      io.disconnect()
      loadGsap()
        .then((kit) => {
          if (cancelled) return
          el.removeEventListener("focusin", onEarlyFocus)
          mm = kit.gsap.matchMedia(el)
          setupRef.current({ ...kit, mm }, el)
        })
        .catch(() => {
          if (!cancelled) showReveals(el)
        })
    }

    // Keyboard focus never lands in content that is still transparent.
    const onEarlyFocus = () => {
      showReveals(el)
      start()
    }
    el.addEventListener("focusin", onEarlyFocus)

    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start()
    }, { rootMargin: "25% 0px" })
    io.observe(el)

    return () => {
      cancelled = true
      io.disconnect()
      el.removeEventListener("focusin", onEarlyFocus)
      mm?.revert()
    }
    // deps are the caller's; ref is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
