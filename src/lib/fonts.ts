import localFont from "next/font/local"

// Local files, not next/font/google: the Google loader fetches at build time,
// and a network hiccup on the build machine should not fail a build.
// Plex Sans is one variable file carrying weight and width, so dense tables
// narrow with `font-stretch` instead of a second family. The file is the
// Fontsource latin subset instanced to the ranges the UI uses (weight 400 to
// 700, width 87 to 100; fontTools varLib.instancer): 49 KB instead of 65 KB
// for the one font the hero text waits on.
const plexSans = localFont({
  // Upright only: italic appears in one muted label, and preloading a second
  // 76 KB file for it delayed the landing page's LCP on mobile.
  src: [{ path: "../app/fonts/IBMPlexSans-var.woff2", weight: "400 700", style: "normal" }],
  variable: "--ff-sans",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "87% 100%" }],
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
