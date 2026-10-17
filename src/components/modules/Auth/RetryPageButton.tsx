"use client"

import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

// Renders the server page again, which repeats whatever check it failed. The
// transition keeps the button busy until the new page has arrived.
const RetryPageButton = () => {
  const router = useRouter()
  const [isRetrying, startRetry] = useTransition()

  return (
    <Button type="button" onClick={() => startRetry(() => router.refresh())} disabled={isRetrying}>
      <RotateCw aria-hidden="true" className={isRetrying ? "size-4 animate-spin" : "size-4"} />
      {isRetrying ? "Trying again..." : "Try again"}
    </Button>
  )
}

export default RetryPageButton
