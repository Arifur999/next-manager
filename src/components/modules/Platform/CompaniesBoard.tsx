"use client"

import CompanySubscriptionSheet, {
  type ICompanySheetTarget,
} from "@/components/modules/Platform/CompanySubscriptionSheet"
import { companiesColumns } from "@/components/modules/Platform/companiesColumns"
import { COMPANIES_TABLE } from "@/components/modules/Platform/companiesTable.config"
import DataTable from "@/components/shared/table/DataTable"
import { Card, CardHeader } from "@/components/ui/card"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { companiesListQuery, plansQuery } from "@/queries/platform.queries"
import type { ICompanyRow } from "@/types/platform.types"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

/**
 * Which company is on which plan, and what each one uses of it.
 *
 * No balances, payments, client names or vault: provisioning a workspace is not
 * a licence to read the books inside it, and the API does not return them.
 * Usage reads "4 / 5" rather than "80%", because that says what to do next.
 */

const isAtLimit = (company: ICompanyRow) =>
  (company.usage.seats_limit !== null && company.usage.seats_used >= company.usage.seats_limit) ||
  (company.usage.projects_limit !== null && company.usage.projects_used >= company.usage.projects_limit)

// The ones about to hit a wall are worth a call, so they are counted rather than spotted by eye.
const CompanyCount = ({ companies, total }: { companies: ICompanyRow[] | undefined; total: number | undefined }) => {
  // Unknown until the list arrives, and "0 companies" must never stand in for that.
  if (!companies) return null

  const count = total ?? companies.length
  const atLimit = companies.filter(isAtLimit).length
  const noun = count === 1 ? "company" : "companies"
  if (atLimit === 0) return <>{count} {noun}, none on this page at a plan limit.</>
  return (
    <>
      {count} {noun} · {atLimit} on this page at a plan limit
    </>
  )
}

// Below sm only the company column shows, and its cell carries the standing and a Change button.
const PHONE_CARDS = "max-sm:[&_td:not(:first-child)]:hidden max-sm:[&_th:not(:first-child)]:hidden"

const CompaniesBoard = () => {
  const queryClient = useQueryClient()
  const [sheetTarget, setSheetTarget] = useState<ICompanySheetTarget | null>(null)

  const { queryString, filterQueryString, dataTableProps } = useServerDataTable<ICompanyRow>(COMPANIES_TABLE)
  const companiesQuery = useQuery({ ...companiesListQuery(queryString), placeholderData: keepPreviousData })
  const { data: plansData } = useQuery(plansQuery())

  const companies = companiesQuery.data?.data
  const plans = plansData?.data
  const columns = useMemo(() => companiesColumns(plans ?? [], (company) => setSheetTarget({ company })), [plans])

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <p className="min-h-5 text-sm text-muted-foreground">
          <CompanyCount companies={companies} total={companiesQuery.data?.meta?.total} />
        </p>
      </CardHeader>

      <div className={`p-4 ${PHONE_CARDS}`}>
        <DataTable
          data={companies ?? []}
          columns={columns}
          tableId="platform-companies"
          exportFileName="plan-assignments"
          exportRows={async () => (await queryClient.fetchQuery(companiesListQuery(filterQueryString))).data}
          {...dataTableProps}
          {...toTableQueryProps(companiesQuery)}
          emptyMessage="Nobody has signed up yet."
        />
      </div>

      <CompanySubscriptionSheet target={sheetTarget} onClose={() => setSheetTarget(null)} />
    </Card>
  )
}

export default CompaniesBoard
