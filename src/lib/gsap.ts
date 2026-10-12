// The only place GSAP plugins are registered. Import gsap things from here,
// never from "gsap" directly, and only from "use client" files.
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase)

// Named by intent. Mirrors --ease-out-expo in globals.css.
CustomEase.create("ease.reveal", "M0,0 C0.16,1 0.3,1 1,1")

gsap.defaults({ ease: "ease.reveal", duration: 0.6 })

if (typeof window !== "undefined") {
  // Touch devices: ignore the address-bar resize so triggers do not jump mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true })
}

/** Use as `markers: DEV_MARKERS`. Flip locally to debug a trigger; never commit true. */
export const DEV_MARKERS = false

export { gsap, ScrollTrigger, SplitText, useGSAP }
