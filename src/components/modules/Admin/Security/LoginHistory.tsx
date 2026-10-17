"use client"

import { loginHistoryColumns } from "@/components/modules/Admin/Security/loginHistoryColumns"
import DataTable from "@/components/shared/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { useQuery } from "@tanstack/react-query"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"
import { loginEventsListQuery } from "@/queries/workspace.queries"

/**
 * Who tried to sign in, and whether it worked.
 *
 * Only this agency's own attempts. An attempt at an address with no account
 * belongs to no company and is not here — which is a property of how the row is
 * written rather than something this screen filters out.
 *
 * The failure count is deliberately not affected by the filter chips. It is the
 * number somebody opens this page to notice, and narrowing the list must not be
 * able to hide it.
 */

const ALL = "__all__"

const FILTERS = [
  { value: ALL, label: "Everything" },
  { value: "false", label: "Failed only" },
  { value: "true", label: "Successful only" },
]

const FailedAttemptsNote = ({ count }: { count: number | undefined }) => {
  // Unknown until the list arrives, and "nothing failed" must never stand in for that.
  if (count === undefined) return null
  if (count === 0) return <>Nothing failed in the last day.</>

  return (
    <>
      {/* Icon and words, never colour alone. */}
      <ShieldAlert className="mr-1 inline size-4" aria-hidden="true" />
      <span className="text-foreground">
        {count} failed attempt{count === 1 ? "" : "s"} in the last day
      </span>
      {" — counted across everything, not just what is filtered below."}
    </>
  )
}

const LoginHistory = () => {
  const [filter, setFilter] = useState(ALL)

  const query = filter === ALL ? "" : `success=${filter}`

  const loginEvents = useQuery(loginEventsListQuery(query))
  const data = loginEvents.data

  const events = data?.data ?? []
  const failedLately = data?.meta?.failed_last_24h
  const retention = data?.meta?.retention_days ?? 90

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="space-y-3 border-b px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Sign-in attempts</CardTitle>
              <p className="text-sm text-muted-foreground">
                <FailedAttemptsNote count={failedLately} />
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={option.value === filter ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={option.value === filter}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <div className="p-4">
          <DataTable
            data={events}
            columns={loginHistoryColumns}
            tableId="sign-ins"
            {...toTableQueryProps(loginEvents)}
            emptyMessage={filter === ALL ? "Nothing recorded yet." : "Nothing matches that."}
          />
        </div>

        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          {/* Said plainly rather than buried: this page stores addresses. */}
          Sign-in times and IP addresses are kept for {retention} days, then deleted. The
          password that was tried is never recorded, successful or not.
        </div>
      </Card>
    </div>
  )
}

export default LoginHistory
