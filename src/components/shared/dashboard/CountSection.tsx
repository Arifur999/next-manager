"use client"

import StatTile from "@/components/shared/StatTile"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCw } from "lucide-react"
import type { ReactNode } from "react"

/**
 * A titled row of counts, of the kind every dashboard opens with.
 *
 * One component for all four workspaces rather than four near-copies: the
 * sections differ in what they count, never in how a count looks, and four
 * implementations would be four places for the spacing to drift.
 *
 * Every tile carries the page it was counted from. A dashboard number is a
 * question — "eleven overdue, which ones?" — and a tile that cannot answer it
 * sends somebody off to find the page themselves. It also keeps the figure
 * honest: the count and the list it summarises are one click apart and read
 * from the same endpoint, so a disagreement is visible rather than theoretical.
 */

export type Count = {
  label: string
  /**
   * A count, or an already-formatted figure like a money amount.
   *
   * Undefined while loading, so the tile can say so instead of showing zero —
   * zero is an answer, and showing it before one is known tells somebody their
   * business is empty when it is merely slow.
   */
  value: number | string | null | undefined
  href?: string
  hint?: string
  icon?: ReactNode
  tone?: 1 | 2 | 3 | 4 | 5
  /** The request behind this figure failed; the tile says so and offers Retry. */
  isError?: boolean
  onRetry?: () => void
}

// Scoped to one tile, so one failed figure never blanks the whole row.
const FailedTile = ({ label, onRetry }: { label: string; onRetry?: () => void }) => (
  <Card role="alert" className="gap-0 p-5">
    <p className="truncate text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm font-medium">This figure did not load.</p>
    {onRetry && (
      <Button type="button" variant="outline" size="sm" className="mt-3 w-fit" onClick={onRetry}>
        <RotateCw aria-hidden="true" className="size-3.5" />
        Retry
      </Button>
    )}
  </Card>
)

const CountSection = ({ title, counts }: { title: string; counts: Count[] }) => (
  <section className="space-y-3">
    <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {counts.map((count) =>
        count.isError ? (
          <FailedTile key={count.label} label={count.label} onRetry={count.onRetry} />
        ) : (
        <StatTile
          key={count.label}
          label={count.label}
          // A skeleton rather than a zero while it loads. Zero is an answer, and
          // showing it before one is known says the business is empty when it
          // is merely slow.
          value={count.value === null || count.value === undefined ? undefined : String(count.value)}
          hint={count.hint}
          href={count.href}
          icon={count.icon}
          tone={count.tone}
        />
        ),
      )}
    </div>
  </section>
)

export default CountSection
