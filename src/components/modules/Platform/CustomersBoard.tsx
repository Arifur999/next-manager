"use client"

import CreateCompanyModal from "@/components/modules/Platform/CreateCompanyModal"
import { isQuietSince } from "@/components/modules/Platform/customerActivity"
import { customersColumns } from "@/components/modules/Platform/customersColumns"
import DataTable from "@/components/shared/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toTableQueryProps } from "@/lib/table/queryProps"
import type { ICompanyRow } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
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

const ALL = "__all__"

const FILTERS: Array<{ value: string; label: string }> = [
  { value: ALL, label: "Everyone" },
  { value: "trialing", label: "On trial" },
  { value: "active", label: "Paying" },
  { value: "past_due", label: "Past due" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Left" },
]

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

const CustomersBoard = ({ defaultFilter = ALL }: { defaultFilter?: string }) => {
  const [filter, setFilter] = useState(defaultFilter)
  const [search, setSearch] = useState("")

  const query = [
    filter === ALL ? "" : `status=${filter}`,
    search.trim() ? `search=${encodeURIComponent(search.trim())}` : "",
  ]
    .filter(Boolean)
    .join("&")

  const companiesQuery = useQuery(companiesListQuery(query))
  const companies = companiesQuery.data?.data

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="space-y-3 border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              <CustomerCount companies={companies} />
            </p>
          </div>

          <CreateCompanyModal />
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

          <div className="relative ml-auto min-w-52">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Company or the person you sold to"
              className="pl-8"
              aria-label="Search customers"
            />
          </div>
        </div>
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={companies ?? []}
          columns={customersColumns}
          tableId="customers"
          {...toTableQueryProps(companiesQuery)}
          emptyMessage={search.trim() || filter !== ALL ? "Nothing matches that." : "Nobody has signed up yet."}
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
