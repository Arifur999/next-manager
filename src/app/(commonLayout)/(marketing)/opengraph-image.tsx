import { HERO } from "@/data/home/hero"
import { site } from "@/data/site"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// Drawn from the same constants as the page, at build time. Colours are the
// palette's light values converted to rgb, because the image renderer has no
// CSS variables or oklch(); they mirror --p-paper-50, --p-graphite-900,
// --p-brand-800, --p-paper-300 and --p-graphite-500.
export const alt = `${site.name}: ${HERO.title}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const PAPER = "rgb(251, 250, 247)"
const GRAPHITE = "rgb(24, 33, 37)"
const TEAL = "rgb(0, 89, 89)"
const RULE = "rgb(224, 222, 218)"
const MUTED = "rgb(91, 101, 106)"

export default async function Image() {
  const [medium, semibold] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og/IBMPlexSans-500.woff")),
    readFile(join(process.cwd(), "src/assets/og/IBMPlexSans-600.woff")),
  ])

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, color: GRAPHITE, padding: "72px 80px", fontFamily: "Plex" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <span style={{ fontWeight: 600 }}>{site.shortName}</span>
          <span style={{ width: 2, height: 28, background: RULE }} />
          <span style={{ fontWeight: 500, color: MUTED }}>Management</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 76, fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 900 }}>{HERO.title}</div>
          <div style={{ display: "flex", height: 2, background: GRAPHITE }} />
          <div style={{ display: "flex", gap: 40, fontSize: 26, fontWeight: 500, color: TEAL }}>
            <span>Leads</span>
            <span>Projects</span>
            <span>Hours</span>
            <span>Invoices in USD</span>
            <span>Banked in BDT</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plex", data: medium, style: "normal", weight: 500 },
        { name: "Plex", data: semibold, style: "normal", weight: 600 },
      ],
    },
  )
}
