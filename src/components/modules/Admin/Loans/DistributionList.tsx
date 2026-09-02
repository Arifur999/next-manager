"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import type { IShareholderDistribution } from "@/types/agencio.types"
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
  isLoading,
  onDelete,
}: {
  distributions: IShareholderDistribution[]
  isLoading: boolean
  onDelete: (id: string) => void
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Distributions</CardTitle>
      <p className="text-sm text-muted-foreground">
        Money out of a real account, and never a cost — paying owners does not change what
        the agency earned.
      </p>
    </CardHeader>

    {isLoading && distributions.length === 0 ? (
      <LoadingBlock />
    ) : distributions.length === 0 ? (
      <EmptyState icon={HandCoins}>Nothing paid out yet.</EmptyState>
    ) : (
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
              onClick={() => onDelete(distribution.id)}
              aria-label={`Reverse the distribution to ${distribution.shareholder?.name}`}
              title="Reverse"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default DistributionList
