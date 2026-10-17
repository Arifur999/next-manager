"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import type { IShareholder } from "@/types/finance.types"
import type { UseQueryResult } from "@tanstack/react-query"
import { PieChart, Power, Trash2 } from "lucide-react"

const allocationNote = (unallocatedPct: number | null) => {
  if (unallocatedPct === null) return "Shares are checked against 100% across everybody still active."
  if (unallocatedPct > 0) return `${unallocatedPct}% of the business is not assigned to anybody.`
  return "Every percent of the business is assigned."
}

/**
 * Who owns the agency.
 *
 * Retiring somebody frees their share for whoever takes it on, which is why
 * there is a Power toggle here and a bin only for people with no distributions
 * — money already paid to somebody has to keep saying who it went to.
 *
 * What is left unallocated is stated rather than left to be worked out: "who
 * owns the rest" is the question this page is opened with.
 */
const ShareholderList = ({
  shareholders,
  unallocatedPct,
  query,
  onToggle,
  onDelete,
}: {
  shareholders: IShareholder[]
  unallocatedPct: number | null
  query: Pick<UseQueryResult, "isError" | "isLoading" | "isFetching" | "refetch">
  onToggle: (shareholder: IShareholder) => void
  onDelete: (shareholder: IShareholder) => void
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Shareholders</CardTitle>
      <p className="text-sm text-muted-foreground">
        {allocationNote(unallocatedPct)}
      </p>
    </CardHeader>

    <PanelState
      query={query}
      errorMessage="Shareholders did not load."
      isEmpty={shareholders.length === 0}
      empty={<EmptyState icon={PieChart}>Nobody recorded yet.</EmptyState>}
    >
      <ul className="divide-y">
        {shareholders.map((shareholder) => (
          <li
            key={shareholder.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-48 flex-1">
              <p className="flex items-center gap-2 font-medium">
                {shareholder.name}
                {!shareholder.is_active && <Badge variant="secondary">retired</Badge>}
              </p>
              <p className="text-xs text-muted-foreground">
                {shareholder.share_pct}% ·{" "}
                {shareholder.total_paid_bdt > 0
                  ? `${formatBdt(shareholder.total_paid_bdt)} paid out`
                  : "nothing paid out yet"}
                {/* Somebody can own a share without ever signing in, so a
                    missing account is a real answer, not a gap. */}
                {shareholder.user ? ` · ${shareholder.user.email}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onToggle(shareholder)}
                aria-label={
                  shareholder.is_active
                    ? `Retire ${shareholder.name}`
                    : `Bring ${shareholder.name} back`
                }
                title={shareholder.is_active ? "Retire" : "Bring back"}
              >
                <Power className="size-4" />
              </Button>

              {shareholder.total_paid_bdt === 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(shareholder)}
                  aria-label={`Delete ${shareholder.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </PanelState>
  </Card>
)

export default ShareholderList
