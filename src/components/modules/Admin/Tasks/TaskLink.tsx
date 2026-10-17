"use client"

import { openTaskSheet, withOpenTask } from "@/components/modules/Admin/Tasks/taskSheetUrl"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"

/**
 * Opens a task's sheet on this page. A real link underneath, so a new tab or a
 * copied address opens the same task; a plain click opens it in place.
 */
const TaskLink = ({ taskId, className, children }: { taskId: string; className?: string; children: ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const openInPlace = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    openTaskSheet(taskId)
  }

  return (
    <Link
      href={withOpenTask(pathname, searchParams.toString(), taskId)}
      // Every card is a link to this same page; prefetching each would be a
      // server render per task for a sheet that never needs one.
      prefetch={false}
      scroll={false}
      onClick={openInPlace}
      className={cn(
        "rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      {children}
    </Link>
  )
}

export default TaskLink
