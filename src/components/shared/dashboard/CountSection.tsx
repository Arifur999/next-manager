"use client"

import StatTile from "@/components/shared/StatTile"
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
}

const CountSection = ({ title, counts }: { title: string; counts: Count[] }) => (
  <section className="space-y-3">
    <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {counts.map((count) => (
        <StatTile
          key={count.label}
          label={count.label}
          // A dash rather than a zero while it loads. Zero is an answer, and
          // showing it before one is known is how a dashboard tells somebody
          // their pipeline is empty when it is merely slow.
          value={count.value === null || count.value === undefined ? "—" : String(count.value)}
          hint={count.hint}
          href={count.href}
          icon={count.icon}
          tone={count.tone}
        />
      ))}
    </div>
  </section>
)

export default CountSection
