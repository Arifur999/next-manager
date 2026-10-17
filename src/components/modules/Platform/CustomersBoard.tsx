"use client"

import CreateCompanyModal from "@/components/modules/Platform/CreateCompanyModal"
import { isQuietSince } from "@/components/modules/Platform/customerActivity"
import { customersColumns } from "@/components/modules/Platform/customersColumns"
import DataTable from "@/components/shared/table/DataTable"
import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { buildQueryString } from "@/lib/queryString"
import { toTableQueryProps } from "@/lib/table/queryProps"
import type { ICompanyRow, SubscriptionStatus } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { companiesListQuery } from "@/queries/platform.queries"

/**
 * The people you sell to.
 *
 * One row per customer: the company, the person it was sold to, what they pay
 * and whether they are still using it. Not a list of every customer's staff —
 * that would put thousands of other people's names on one screen and answer no
 * question running a platform actually asks.
 *
 * The same board serves "All" and "Active"; they differ only by which filter
 * arrives. Two screens would have been two places to fix the same bug.
 */

const STANDING_FILTER: DataTableFilterConfig = {
  id: "status",
  type: "single-select",
  label: "Standing",
  options: [
    { label: "On trial", value: "trialing" },
    { label: "Paying", value: "active" },
    { label: "Past due", value: "past_due" },
    { label: "Suspended", value: "suspended" },
    { label: "Left", value: "cancelled" },
  ],
}

const CustomerCount = ({ companies }: { companies: ICompanyRow[] | undefined }) => {
  // Unknown until the list arrives, and "0 companies" must never stand in for that.
  if (!companies) return null

  const quiet = companies.filter((row) => isQuietSince(row.last_active_at)).length

  return (
    <>
      {companies.length} {companies.length === 1 ? "company" : "companies"}
      {quiet > 0 && (
        <>
          {" · "}
          <span className="text-foreground">{quiet} quiet for a month or more</span>
        </>
      )}
    </>
  )
}

const CustomersBoard = ({ defaultFilter }: { defaultFilter?: SubscriptionStatus }) => {
  const [status, setStatus] = useState<string | undefined>(defaultFilter)
  const [search, setSearch] = useState("")

  // Both are applied by the API, whose search also matches a company's other
  // admins, which the rows do not carry.
  const companiesQuery = useQuery(companiesListQuery(buildQueryString({ status, search })))
  const companies = companiesQuery.data?.data

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              <CustomerCount companies={companies} />
            </p>
          </div>

          <CreateCompanyModal />
        </div>
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={companies ?? []}
          columns={customersColumns}
          tableId="customers"
          exportFileName="customers"
          search={{ value: search, placeholder: "Company or the person you sold to", onDebouncedChange: setSearch }}
          filters={{
            configs: [STANDING_FILTER],
            values: { status },
            onFilterChange: (_filterId, value) => setStatus(typeof value === "string" ? value : undefined),
            onClearAll: () => {
              setStatus(undefined)
              setSearch("")
            },
          }}
          {...toTableQueryProps(companiesQuery)}
          // Shown only when nothing narrows the list; a filtered view says so itself.
          emptyMessage="Nobody has signed up yet."
        />
      </div>

      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Changing a plan or suspending a customer happens on{" "}
        <Link href="/platform/plans" className="text-primary underline-offset-4 hover:underline">
          the plans screen
        </Link>
        .
      </div>
    </Card>
  )
}

export default CustomersBoard
