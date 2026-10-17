"use client"

import {
  companiesColumns,
  NOT_SET_UP,
  STATUS_LABEL,
  STATUSES,
} from "@/components/modules/Platform/companiesColumns"
import DataTable from "@/components/shared/table/DataTable"
import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { companiesListQuery, plansQuery } from "@/queries/platform.queries"
import type { ICompanyRow } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"

/**
 * Every company on the platform, and what it is paying.
 *
 * What is deliberately absent is the point: no balances, no payments, no client
 * names, no vault. Provisioning a workspace is not a licence to read the books
 * of the business inside it, and the API does not return those columns at all —
 * this screen could not show them if it tried.
 *
 * Usage is shown as used-of-limit rather than a percentage. "4 of 5 seats" says
 * what to do next; "80%" does not.
 */

const STANDING_FILTER: DataTableFilterConfig = {
  id: "standing",
  type: "single-select",
  label: "Standing",
  options: [
    ...STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
    { value: NOT_SET_UP, label: "not set up" },
  ],
}

const isAtLimit = (company: ICompanyRow) =>
  (company.usage.seats_limit !== null && company.usage.seats_used >= company.usage.seats_limit) ||
  (company.usage.projects_limit !== null && company.usage.projects_used >= company.usage.projects_limit)

// The ones about to hit a wall are the ones worth a call, so they are counted
// rather than left to be spotted by eye.
const CompanyCount = ({ companies }: { companies: ICompanyRow[] | undefined }) => {
  // Unknown until the list arrives, and "0 companies" must never stand in for that.
  if (!companies) return null
  if (companies.length === 0) return <>No companies yet.</>

  const atLimit = companies.filter(isAtLimit).length
  if (atLimit === 0) return <>{companies.length} on the platform, none at a plan limit.</>
  return (
    <>
      {companies.length} on the platform · {atLimit} at a plan limit
    </>
  )
}

const CompaniesBoard = () => {
  const companiesQuery = useQuery(companiesListQuery())
  const { data: plansData } = useQuery(plansQuery())

  const companies = companiesQuery.data?.data
  const plans = plansData?.data ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Companies</CardTitle>
        <p className="text-sm text-muted-foreground">
          <CompanyCount companies={companies} />
        </p>
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={companies ?? []}
          columns={companiesColumns(plans)}
          tableId="platform-companies"
          exportFileName="companies"
          search={{ placeholder: "Company or contact email" }}
          filters={{ configs: [STANDING_FILTER] }}
          {...toTableQueryProps(companiesQuery)}
          emptyMessage="Nobody has signed up yet."
        />
      </div>
    </Card>
  )
}

export default CompaniesBoard
