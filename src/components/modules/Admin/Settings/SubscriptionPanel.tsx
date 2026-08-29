"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getMySubscription } from "@/services/agencio.services"
import type { IMySubscription, SubscriptionStatus } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"

/**
 * The company's own standing with the platform.
 *
 * Exists because a refusal needs somewhere to point. "Starter includes 5 seats
 * and all of them are in use" is a message an admin can hit at any moment, and
 * without a screen showing the plan and the count it leaves them with nothing
 * to check.
 *
 * Reachable even while suspended — reads are never blocked, which is exactly so
 * this page still opens when it is the one page that matters.
 */

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  suspended: "Suspended",
  cancelled: "Cancelled",
}

const STATUS_NOTE: Record<SubscriptionStatus, string> = {
  trialing: "Everything works. Nothing has been charged yet.",
  active: "Everything works.",
  // The honest version: writing still works, and that is the whole point of
  // the state existing.
  past_due: "The period has ended. Writing still works for a few more days.",
  suspended: "Reading still works; nothing can be created or changed.",
  cancelled: "Your data is intact. Renew to start writing again.",
}

const STATUS_TONE: Record<SubscriptionStatus, "secondary" | "outline" | "destructive"> = {
  trialing: "outline",
  active: "secondary",
  past_due: "outline",
  suspended: "destructive",
  cancelled: "destructive",
}

const UsageBar = ({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number | null
}) => {
  const atLimit = limit !== null && used >= limit

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5 text-lg font-semibold tabular-nums">
        {used}
        <span className="text-sm font-normal text-muted-foreground">
          of {limit === null ? "unlimited" : limit}
        </span>
        {/* A word, not a colour — the state has to survive greyscale. */}
        {atLimit && (
          <Badge variant="destructive" className="text-[10px]">
            full
          </Badge>
        )}
      </p>
    </div>
  )
}

const SubscriptionPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => getMySubscription(),
  })

  const result = data?.data as IMySubscription | undefined

  if (isLoading && !result) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!result) return null

  const { subscription, usage } = result

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">
            {subscription ? subscription.plan.name : "No plan assigned"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {subscription
              ? STATUS_NOTE[subscription.status]
              : /* Not an error state: a company the platform has not set up yet
                   is allowed to work normally. Saying so beats an empty card. */
                "This workspace has not been put on a plan. Everything works."}
          </p>
        </div>

        {subscription && (
          <Badge variant={STATUS_TONE[subscription.status]}>
            {STATUS_LABEL[subscription.status]}
          </Badge>
        )}
      </CardHeader>

      <div className="grid gap-5 px-5 py-4 sm:grid-cols-3">
        <UsageBar label="People" used={usage.seats_used} limit={usage.seats_limit} />
        <UsageBar label="Projects" used={usage.projects_used} limit={usage.projects_limit} />

        <div>
          <p className="text-xs text-muted-foreground">
            {subscription?.trial_ends_at ? "Trial ends" : "Paid up to"}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {subscription?.trial_ends_at
              ? format(parseISO(subscription.trial_ends_at), "dd MMM yyyy")
              : subscription?.current_period_end
                ? format(parseISO(subscription.current_period_end), "dd MMM yyyy")
                : "—"}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default SubscriptionPanel
