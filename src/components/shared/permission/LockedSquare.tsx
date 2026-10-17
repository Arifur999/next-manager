"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { lockedSquareReason } from "@/types/permission.types"
import { Lock } from "lucide-react"

// A square the role gate decides on its own. Shown as text rather than a
// picker, so nothing on the grid looks as if it changes access when it cannot.
const LockedSquare = ({ module, action }: { module: string; action: string }) => {
  const reason = lockedSquareReason(module, action)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Lock aria-hidden="true" className="size-3.5" />
          Admin only
          <span className="sr-only">. {reason}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}

export default LockedSquare
