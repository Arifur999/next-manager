import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

// A highlighter stroke on a number, tied to a numbered margin note. Marker is
// for annotation only: it never colours text and never signals a status.
export const Marked = ({ n, children, className }: { n: number; children: ReactNode; className?: string }) => (
  <span className={cn("relative inline-block", className)}>
    <span className="rounded-[2px] bg-marker px-1 text-marker-foreground [box-decoration-break:clone]">{children}</span>
    <sup aria-hidden="true" className="ml-0.5 align-super text-[0.625rem] font-semibold text-foreground">
      {n}
    </sup>
  </span>
)

export const MarkerNotes = ({ notes, className }: { notes: string[]; className?: string }) => (
  <ol className={cn("grid gap-2 text-sm text-muted-foreground", className)}>
    {notes.map((note, index) => (
      <li key={note} className="flex gap-2.5">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-marker text-[0.6875rem] font-semibold text-marker-foreground"
        >
          {index + 1}
        </span>
        <span>{note}</span>
      </li>
    ))}
  </ol>
)
