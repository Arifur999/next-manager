"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

// sonner (and its icon set) loads as its own chunk after hydration, and not at
// all on the marketing page, which never raises a toast. It stays in the root
// layout so a toast raised just before a navigation (signed in, then sent to
// the dashboard) survives the change of layout.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((mod) => mod.Toaster), { ssr: false })

const NO_TOASTS = new Set(["/"])

export default function AppToaster() {
  const pathname = usePathname()
  if (NO_TOASTS.has(pathname)) return null
  return <Toaster position="top-right" richColors />
}
