"use client"

import ErrorState from "@/components/shared/state/ErrorState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { leaveBalanceQuery } from "@/queries/people.queries"

// What is left of each allowance this year, from approved days only. An uncapped
// kind has a null `remaining` and reads "no limit": zero would mean none left.
const LeaveBalanceCard = () => {
  const balanceList = useQuery(leaveBalanceQuery())
  const balances = balanceList.data?.data ?? []

  // Nothing to show stays invisible; a failure is said out loud.
  if (!balanceList.isError && balances.length === 0) return null

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Your allowance this year</CardTitle>
        <p className="text-sm text-muted-foreground">
          Approved days only — a request still waiting does not come off it yet.
        </p>
      </CardHeader>

      {balanceList.isError ? (
        <ErrorState
          message="Your allowance did not load."
          onRetry={() => void balanceList.refetch()}
          isRetrying={balanceList.isFetching}
        />
      ) : (
        <ul className="divide-y">
          {balances.map((balance) => (
            <li
              key={balance.leave_type.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium">{balance.leave_type.name}</p>
                <p className="text-xs text-muted-foreground">
                  {balance.leave_type.is_paid ? "Paid" : "Unpaid"} · {balance.days_taken} taken
                </p>
              </div>

              <span className="text-sm tabular-nums">
                {balance.remaining === null ? (
                  <span className="text-muted-foreground">no limit</span>
                ) : (
                  <>
                    {balance.remaining}
                    <span className="text-muted-foreground"> of {balance.days_per_year} left</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default LeaveBalanceCard
