import localFont from "next/font/local"

// Local files, not next/font/google: the Google loader fetches at build time,
// and a network hiccup on the build machine should not fail a build.
// Plex Sans is one variable file carrying weight (100 to 700) and width (75 to
// 100), so dense tables narrow with `font-stretch` instead of a second family.
const plexSans = localFont({
  // Upright only: italic appears in one muted label, and preloading a second
  // 76 KB file for it delayed the landing page's LCP on mobile.
  src: [{ path: "../app/fonts/IBMPlexSans-var.woff2", weight: "100 700", style: "normal" }],
  variable: "--ff-sans",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
})

// Invoice numbers, codes and amounts in product frames.
const plexMono = localFont({
  src: [
    { path: "../app/fonts/IBMPlexMono-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/IBMPlexMono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--ff-mono",
  display: "swap",
  preload: false,
})

export const fontVariables = `${plexSans.variable} ${plexMono.variable}`
