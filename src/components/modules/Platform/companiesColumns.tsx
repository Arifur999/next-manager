"use client"

import StandingBadge from "@/components/modules/Platform/StandingBadge"
import SubscriptionEditor from "@/components/modules/Platform/SubscriptionEditor"
import { standingLabel } from "@/components/modules/Platform/subscriptionStatus"
import { Button } from "@/components/ui/button"
import { toDate } from "@/lib/dates"
import type { ICompanyRow, IPlan } from "@/types/platform.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

const UsageCell = ({ used, limit }: { used: number; limit: number | null }) => (
  <span className="tabular-nums">
    {used}
    {/* Null is unlimited, and saying so beats a dash the reader has to interpret. */}
    <span className="text-muted-foreground"> / {limit === null ? "∞" : limit}</span>
  </span>
)

const usageText = (used: number, limit: number | null) => `${used} of ${limit ?? "unlimited"}`

const planName = (company: ICompanyRow) => company.subscription?.plan.name ?? ""

// `onChange` opens the company in a sheet; on a phone that is the only editor shown.
export const companiesColumns = (
  plans: IPlan[],
  onChange: (company: ICompanyRow) => void,
): ColumnDef<ICompanyRow>[] => [
  {
    id: "company",
    accessorFn: (company) => `${company.name} ${company.email}`,
    header: "Company",
    enableHiding: false,
    meta: {
      exportValue: (company) => (company.email ? `${company.name} (${company.email})` : company.name),
    },
    cell: ({ row }) => (
      <>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.email || "no contact email"} · joined {format(toDate(row.original.created_at), "dd MMM yyyy")}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
          <StandingBadge status={row.original.subscription?.status} />
          <Button type="button" size="sm" variant="outline" onClick={() => onChange(row.original)}>
            Change
          </Button>
        </div>
      </>
    ),
  },
  {
    id: "seats",
    accessorFn: (company) => company.usage.seats_used,
    header: "Seats",
    meta: { exportValue: (company) => usageText(company.usage.seats_used, company.usage.seats_limit) },
    cell: ({ row }) => <UsageCell used={row.original.usage.seats_used} limit={row.original.usage.seats_limit} />,
  },
  {
    id: "projects",
    accessorFn: (company) => company.usage.projects_used,
    header: "Projects",
    meta: { exportValue: (company) => usageText(company.usage.projects_used, company.usage.projects_limit) },
    cell: ({ row }) => (
      <UsageCell used={row.original.usage.projects_used} limit={row.original.usage.projects_limit} />
    ),
  },
  {
    id: "standing",
    accessorFn: (company) => standingLabel(company.subscription?.status),
    header: "Standing",
    enableSorting: false,
    cell: ({ row }) => <StandingBadge status={row.original.subscription?.status} />,
  },
  {
    id: "plan",
    accessorFn: planName,
    header: "Plan",
    enableSorting: false,
    // Keyed by company: rows are matched by position, and an editor holding
    // one company's unsaved choice must never be handed another company.
    cell: ({ row }) => <SubscriptionEditor key={row.original.id} company={row.original} plans={plans} />,
  },
]
