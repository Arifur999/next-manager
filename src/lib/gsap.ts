// The only place GSAP plugins are registered. GSAP is not in the initial
// bundle: loadGsap() imports core, ScrollTrigger, SplitText and CustomEase on
// first call (from useLazyGsap, when an animated section nears the viewport),
// registers them once and caches the kit. Only call it from "use client" files.
import type { gsap as GsapType } from "gsap"
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger"
import type { SplitText as SplitTextType } from "gsap/SplitText"

export type GsapKit = {
  gsap: typeof GsapType
  ScrollTrigger: typeof ScrollTriggerType
  SplitText: typeof SplitTextType
}

let kit: GsapKit | null = null
let pending: Promise<GsapKit> | null = null

export function loadGsap(): Promise<GsapKit> {
  if (kit) return Promise.resolve(kit)
  pending ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("gsap/CustomEase"),
  ])
    .then(([{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }]) => {
      gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
      // Named by intent. Mirrors --ease-out-expo in globals.css.
      CustomEase.create("ease.reveal", "M0,0 C0.16,1 0.3,1 1,1")
      gsap.defaults({ ease: "ease.reveal", duration: 0.6 })
      // Touch devices: ignore the address-bar resize so triggers do not jump mid-scroll.
      ScrollTrigger.config({ ignoreMobileResize: true })
      kit = { gsap, ScrollTrigger, SplitText }
      return kit
    })
    .catch((error: unknown) => {
      // Let a later call retry instead of caching the failure.
      pending = null
      throw error
    })
  return pending
}

/** The kit if something already loaded it, else null. Never triggers a load. */
export function getLoadedGsap(): GsapKit | null {
  return kit
}

/** Use as `markers: DEV_MARKERS`. Flip locally to debug a trigger; never commit true. */
export const DEV_MARKERS = false
