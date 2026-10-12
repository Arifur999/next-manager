"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

// What every error boundary shows. Server error messages are hidden in
// production, so the digest is the only thing worth handing to support.
const RouteErrorState = ({
  digest,
  retry,
  homeHref = "/",
}: {
  digest?: string
  retry: () => void
  homeHref?: string
}) => (
  <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center">
    <h1 className="text-xl font-semibold">This page could not be loaded</h1>
    <p className="text-sm text-muted-foreground">
      Something went wrong on our side. Try again, and if it keeps happening, share the reference below.
    </p>
    {digest && <p className="font-mono text-xs text-muted-foreground">Reference: {digest}</p>}
    <div className="flex gap-2">
      <Button onClick={() => retry()}>Retry</Button>
      <Button variant="outline" asChild>
        <Link href={homeHref}>Go home</Link>
      </Button>
    </div>
  </div>
)

export default RouteErrorState
