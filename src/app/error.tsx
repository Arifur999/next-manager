"use client"

import dynamic from "next/dynamic"

// The root error boundary ships with every page outside the dashboard, the
// landing page included. Its UI (Button, cva, tailwind-merge) loads only when
// an error is actually shown; until then a plain alert holds the space.
const RouteErrorState = dynamic(() => import("@/components/shared/state/RouteErrorState"), {
  loading: () => (
    <p role="alert" className="px-6 py-16 text-center text-sm text-muted-foreground">
      This page could not be loaded.
    </p>
  ),
})

const RootError = ({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) => (
  <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center">
    <RouteErrorState digest={error.digest} retry={retry} />
  </main>
)

export default RootError
