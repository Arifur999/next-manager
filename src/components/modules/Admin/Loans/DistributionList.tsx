"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import type { IShareholderDistribution } from "@/types/finance.types"
import type { UseQueryResult } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { HandCoins, Trash2 } from "lucide-react"

/**
 * Profit paid out to owners.
 *
 * Deliberately not an expense, and the card says so: an expense is a cost of
 * earning profit, this is profit already earned being handed over. Counting it
 * as a cost would let an agency reduce its own reported profit by paying
 * itself.
 */
const DistributionList = ({
  distributions,
  query,
  onDelete,
}: {
  distributions: IShareholderDistribution[]
  query: Pick<UseQueryResult, "isError" | "isLoading" | "isFetching" | "refetch">
  onDelete: (distribution: IShareholderDistribution) => void
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Distributions</CardTitle>
      <p className="text-sm text-muted-foreground">
        Money out of a real account, and never a cost — paying owners does not change what
        the agency earned.
      </p>
    </CardHeader>

    <PanelState
      query={query}
      errorMessage="Distributions did not load."
      isEmpty={distributions.length === 0}
      empty={<EmptyState icon={HandCoins}>Nothing paid out yet.</EmptyState>}
    >
      <ul className="divide-y">
        {distributions.map((distribution) => (
          <li
            key={distribution.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-48 flex-1">
              <p className="font-medium">{distribution.shareholder?.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(distribution.date), "d MMM yyyy")}
                {distribution.account ? ` · ${distribution.account.name}` : ""}
                {distribution.notes ? ` · ${distribution.notes}` : ""}
              </p>
            </div>

            <span className="tabular-nums">{formatBdt(distribution.amount_bdt)}</span>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(distribution)}
              aria-label={`Reverse the distribution to ${distribution.shareholder?.name}`}
              title="Reverse"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </PanelState>
  </Card>
)

export default DistributionList
