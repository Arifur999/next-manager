// Motion tokens for JavaScript animation, mirroring the CSS custom properties in
// globals.css so both sides move at the same speed. Seconds, as GSAP expects.
export const DURATION = { instant: 0.1, fast: 0.15, base: 0.22, slow: 0.32, page: 0.4, reveal: 0.6 } as const

export const EASE = {
  outQuart: [0.25, 1, 0.5, 1],
  outExpo: [0.16, 1, 0.3, 1],
  inQuart: [0.5, 0, 0.75, 0],
  inOutCubic: [0.65, 0, 0.35, 1],
} as const

/** Media queries shared by gsap.matchMedia() and CSS logic. */
export const MQ = {
  motionOK: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const
