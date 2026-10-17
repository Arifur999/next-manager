import { isQuietSince } from "@/components/modules/Platform/customerActivity"
import { monthlyPrice, planOptionLabel } from "@/components/modules/Platform/planLabel"
import StandingBadge from "@/components/modules/Platform/StandingBadge"
import { NOT_SET_UP_LABEL, standingLabel } from "@/components/modules/Platform/subscriptionStatus"
import RelativeTime from "@/components/shared/RelativeTime"
import { Badge } from "@/components/ui/badge"
import { toDate } from "@/lib/dates"
import type { ICompanyRow } from "@/types/platform.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export const customersColumns: ColumnDef<ICompanyRow>[] = [
  {
    id: "company",
    accessorKey: "name",
    header: "Company",
    cell: ({ row }) => (
      <>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          signed up {format(toDate(row.original.created_at), "d MMM yyyy")}
        </p>
      </>
    ),
  },
  {
    id: "sold_to",
    accessorFn: (company) => company.admin?.full_name,
    header: "Who you sold to",
    enableSorting: false,
    meta: {
      exportValue: (company) => (company.admin ? `${company.admin.full_name} (${company.admin.email})` : "no admin account"),
    },
    cell: ({ row }) => {
      const { admin } = row.original
      // Real, and worth seeing: a company whose admin was removed has nobody
      // who can let anyone back in.
      if (!admin) return <span className="text-xs text-muted-foreground">no admin account</span>

      return (
        <>
          <p>{admin.full_name}</p>
          <a
            href={`mailto:${admin.email}`}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {admin.email}
          </a>
        </>
      )
    },
  },
  {
    id: "plan",
    accessorFn: (company) => company.subscription?.plan.name,
    header: "Plan",
    enableSorting: false,
    meta: { exportValue: (company) => (company.subscription ? planOptionLabel(company.subscription.plan) : NOT_SET_UP_LABEL) },
    cell: ({ row }) => {
      const { subscription } = row.original
      if (!subscription) return <span className="text-xs text-muted-foreground">{NOT_SET_UP_LABEL}</span>

      return (
        <>
          <p>{subscription.plan.name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{monthlyPrice(subscription.plan.price_usd)}</p>
        </>
      )
    },
  },
  {
    id: "seats",
    accessorFn: (company) => company.usage.seats_used,
    header: "Seats",
    meta: { exportValue: (company) => `${company.usage.seats_used} of ${company.usage.seats_limit ?? "unlimited"}` },
    cell: ({ row }) => {
      const { seats_used, seats_limit } = row.original.usage
      const seatsFull = seats_limit !== null && seats_used >= seats_limit

      return (
        <>
          <span className="tabular-nums">
            {seats_used}
            <span className="text-muted-foreground">
              {" / "}
              {seats_limit === null ? "∞" : seats_limit}
            </span>
          </span>
          {seatsFull && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              full
            </Badge>
          )}
        </>
      )
    },
  },
  {
    id: "last_used",
    // "" sorts a company that was never used as the quietest of all.
    accessorFn: (company) => company.last_active_at ?? "",
    header: "Last used",
    meta: { exportValue: (company) => company.last_active_at ?? "never used" },
    cell: ({ row }) => {
      const lastActiveAt = row.original.last_active_at
      const isQuiet = isQuietSince(lastActiveAt)

      return (
        <>
          <span className={isQuiet ? "text-foreground" : "text-muted-foreground"}>
            {lastActiveAt ? <RelativeTime value={lastActiveAt} /> : "never used"}
          </span>
          {isQuiet && (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">quiet</span>
          )}
        </>
      )
    },
  },
  {
    id: "standing",
    accessorFn: (company) => company.subscription?.status,
    header: "Standing",
    enableSorting: false,
    meta: { exportValue: (company) => standingLabel(company.subscription?.status) },
    cell: ({ row }) => <StandingBadge status={row.original.subscription?.status} />,
  },
]
