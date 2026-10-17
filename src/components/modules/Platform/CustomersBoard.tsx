"use client"

import AddCompanyMenu from "@/components/modules/Platform/AddCompanyMenu"
import CompanySubscriptionSheet, {
  type ICompanySheetTarget,
} from "@/components/modules/Platform/CompanySubscriptionSheet"
import { companiesText } from "@/components/modules/Platform/companiesText"
import { COMPANIES_TABLE, onlyPaying, PAYING_COMPANIES_TABLE } from "@/components/modules/Platform/companiesTable.config"
import { isQuietSince } from "@/components/modules/Platform/customerActivity"
import { customersColumns } from "@/components/modules/Platform/customersColumns"
import { isLockedOut } from "@/components/modules/Platform/subscriptionStatus"
import DataTable from "@/components/shared/table/DataTable"
import type { DataTableActions } from "@/components/shared/table/dataTable.types"
import { Card, CardHeader } from "@/components/ui/card"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { companiesListQuery } from "@/queries/platform.queries"
import type { ICompanyRow } from "@/types/platform.types"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Layers, RotateCcw } from "lucide-react"
import { useState } from "react"

/**
 * The companies you sell to: one row per company, the person it was sold to,
 * what it pays and whether it is still used. Not every customer's staff, which
 * would put thousands of other people's names on one screen.
 *
 * Paying companies is the same board held to one standing.
 */

const CustomerCount = ({ companies, total }: { companies: ICompanyRow[] | undefined; total: number | undefined }) => {
  // Unknown until the list arrives, and "0 companies" must never stand in for that.
  if (!companies) return null

  const count = total ?? companies.length
  const quiet = companies.filter((row) => isQuietSince(row.last_active_at)).length

  return (
    <>
      {companiesText(count)}
      {quiet > 0 && <span className="text-foreground"> · {quiet} on this page quiet for a month or more</span>}
    </>
  )
}

const CustomersBoard = ({ payingOnly = false }: { payingOnly?: boolean }) => {
  const queryClient = useQueryClient()
  const [sheetTarget, setSheetTarget] = useState<ICompanySheetTarget | null>(null)

  const { queryString, filterQueryString, dataTableProps } = useServerDataTable<ICompanyRow>(
    payingOnly ? PAYING_COMPANIES_TABLE : COMPANIES_TABLE,
  )
  const scoped = (query: string) => (payingOnly ? onlyPaying(query) : query)

  const companiesQuery = useQuery({ ...companiesListQuery(scoped(queryString)), placeholderData: keepPreviousData })
  const companies = companiesQuery.data?.data

  const rowActions: DataTableActions<ICompanyRow> = {
    extra: [
      { label: "Change plan", icon: Layers, onClick: (company) => setSheetTarget({ company }) },
      {
        label: "Restore",
        icon: RotateCcw,
        onClick: (company) => setSheetTarget({ company, initialStatus: "active" }),
        hidden: (company) => !isLockedOut(company.subscription?.status),
      },
      {
        label: "Suspend",
        icon: Ban,
        destructive: true,
        onClick: (company) => setSheetTarget({ company, initialStatus: "suspended" }),
        hidden: (company) => !company.subscription || isLockedOut(company.subscription.status),
      },
    ],
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        {/* The line keeps its height while the count loads, so the table does not jump. */}
        <p className="min-h-5 text-sm text-muted-foreground">
          <CustomerCount companies={companies} total={companiesQuery.data?.meta?.total} />
        </p>
        <AddCompanyMenu />
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={companies ?? []}
          columns={customersColumns}
          tableId="customers"
          exportFileName={payingOnly ? "paying-companies" : "companies"}
          exportRows={async () =>
            (await queryClient.fetchQuery(companiesListQuery(scoped(filterQueryString)))).data
          }
          actions={rowActions}
          {...dataTableProps}
          {...toTableQueryProps(companiesQuery)}
          // Shown only when nothing narrows the list; a filtered view says so itself.
          emptyMessage={payingOnly ? "Nobody is paying yet." : "Nobody has signed up yet."}
        />
      </div>

      <CompanySubscriptionSheet target={sheetTarget} onClose={() => setSheetTarget(null)} />
    </Card>
  )
}

export default CustomersBoard
