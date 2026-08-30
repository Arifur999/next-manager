"use client"

import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { getKpi } from "@/services/agencio.services"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * What each team spent its time on, and what it cost.
 *
 * The only report here with no card of its own before — the data arrived with
 * departments, which is what makes the question askable at all. Role cannot
 * answer it: an agency's designers and developers are all `operations`.
 *
 * Hours and cost come from the delivery scope rather than a second query, so
 * this page and the delivery dashboard can never disagree.
 */

type DepartmentRow = {
  id: string | null
  name: string
  people: number
  hours_logged: number
  paid_bdt: number
}

const TeamReport = () => {
  const { data } = useQuery({
    queryKey: ["kpi", "delivery"],
    queryFn: () => getKpi<{ by_department?: DepartmentRow[] }>("delivery"),
  })

  const rows = (data?.data?.by_department ?? []) as DepartmentRow[]

  const mostHours = Math.max(...rows.map((row) => row.hours_logged), 1)
  const mostPaid = Math.max(...rows.map((row) => row.paid_bdt), 1)
  const hasDepartments = rows.some((row) => row.id !== null)

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Hours by team</CardTitle>
          <p className="text-sm text-muted-foreground">
            Time logged in the current window, per department.
          </p>
        </CardHeader>

        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nothing logged yet.
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <ShareRow
                key={row.id ?? "none"}
                label={row.name}
                sub={`${row.people} ${row.people === 1 ? "person" : "people"}`}
                value={`${row.hours_logged.toFixed(1)} h`}
                share={(row.hours_logged / mostHours) * 100}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Cost by team</CardTitle>
          <p className="text-sm text-muted-foreground">
            Payouts in the same window. Grouped through the person, so somebody moving
            between teams moves their cost with them.
          </p>
        </CardHeader>

        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nothing paid out yet.
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <ShareRow
                key={row.id ?? "none"}
                label={row.name}
                value={formatBdt(row.paid_bdt)}
                share={(row.paid_bdt / mostPaid) * 100}
              />
            ))}
          </ul>
        )}
      </Card>

      {!hasDepartments && rows.length > 0 && (
        // Everybody in one "No department" row is a true answer and a useless
        // one, so it says what would make it useful.
        <p className="px-1 text-sm text-muted-foreground">
          Everyone is in the same row because no departments exist yet.{" "}
          <Link
            href="/admin/dashboard/departments"
            className="text-primary underline-offset-4 hover:underline"
          >
            Add some
          </Link>{" "}
          and this splits by team.
        </p>
      )}
    </div>
  )
}

export default TeamReport
