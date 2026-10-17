"use client"

import { loginHistoryColumns } from "@/components/modules/Admin/Security/loginHistoryColumns"
import DataTable from "@/components/shared/table/DataTable"
import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { buildQueryString } from "@/lib/queryString"
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
 * The failure count is deliberately not affected by the filters. It is the
 * number somebody opens this page to notice, and narrowing the list must not be
 * able to hide it.
 */

// Sent to the API as success=, not applied to the rows already here: the API
// returns the latest 100 attempts, so filtering those would miss older failures.
const RESULT_FILTER: DataTableFilterConfig = {
  id: "success",
  type: "single-select",
  label: "Result",
  options: [
    { label: "Refused", value: "false" },
    { label: "Signed in", value: "true" },
  ],
}

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
  const [success, setSuccess] = useState<string>()

  const loginEvents = useQuery(loginEventsListQuery(buildQueryString({ success })))
  const data = loginEvents.data

  const events = data?.data ?? []
  const failedLately = data?.meta?.failed_last_24h
  const retention = data?.meta?.retention_days ?? 90

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <div>
            <CardTitle className="text-base">Sign-in attempts</CardTitle>
            <p className="text-sm text-muted-foreground">
              <FailedAttemptsNote count={failedLately} />
            </p>
          </div>
        </CardHeader>

        <div className="p-4">
          <DataTable
            data={events}
            columns={loginHistoryColumns}
            tableId="sign-ins"
            filters={{
              configs: [RESULT_FILTER],
              values: { success },
              onFilterChange: (_filterId, value) => setSuccess(typeof value === "string" ? value : undefined),
              onClearAll: () => setSuccess(undefined),
            }}
            {...toTableQueryProps(loginEvents)}
            // Shown only when nothing narrows the list; a filtered view says so itself.
            emptyMessage="Nothing recorded yet."
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
