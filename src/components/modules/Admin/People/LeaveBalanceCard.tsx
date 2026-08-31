"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeaveBalance } from "@/services/agencio.services"
import type { ILeaveBalance } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"

/**
 * What is left of somebody's allowance this year.
 *
 * An uncapped type shows "no limit" rather than a number. `remaining` is null
 * for those, and rendering null as zero would say the opposite of what is true
 * — "tracked but not capped" and "you have none left" are opposite answers.
 *
 * Only approved days are counted, which is worth saying: a balance that moved
 * on pending requests would drop and jump back when one was turned down.
 */
const LeaveBalanceCard = () => {
  const { data } = useQuery({ queryKey: ["leave-balance"], queryFn: () => getLeaveBalance() })
  const balances = (data?.data ?? []) as ILeaveBalance[]

  if (balances.length === 0) return null

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Your allowance this year</CardTitle>
        <p className="text-sm text-muted-foreground">
          Approved days only — a request still waiting does not come off it yet.
        </p>
      </CardHeader>

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
    </Card>
  )
}

export default LeaveBalanceCard
