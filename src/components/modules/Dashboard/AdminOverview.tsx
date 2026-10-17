"use client"

import CountSection from "@/components/shared/dashboard/CountSection"
import { countFields, queryFields, useCount } from "@/components/shared/dashboard/useCount"
import { formatBdt, formatUsd } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowDownLeft,
  FolderKanban,
  ListChecks,
  Receipt,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import { taskReportQuery, workloadQuery } from "@/queries/work.queries"
import { usersListQuery } from "@/queries/people.queries"
import { dashboardQuery } from "@/queries/insights.queries"

/**
 * What an admin opens the morning with.
 *
 * Counts, not ratios. The analytical band underneath answers "how are we
 * doing"; this answers "what is there", which is the question somebody has
 * before they have any other one.
 *
 * Every figure is read from the endpoint that serves the page its tile links
 * to — through `meta.total`, so a count costs one row rather than the whole
 * list. That is the rule that keeps a tile from disagreeing with the screen it
 * sends you to.
 */
const AdminOverview = () => {
  const clients = useCount(clientsListQuery("limit=1"))
  const activeClients = useCount(clientsListQuery("status=active&limit=1"))
  const projects = useCount(projectsListQuery("limit=1"))
  const team = useCount(usersListQuery("limit=1"))

  const reportQuery = useQuery(taskReportQuery())
  const reportData = reportQuery.data
  const report = reportData?.data

  const dashboardQueryResult = useQuery(dashboardQuery())
  const dashboardData = dashboardQueryResult.data
  const money = dashboardData?.data

  const workloadQueryResult = useQuery(workloadQuery())
  const workloadData = workloadQueryResult.data
  const workload = workloadData?.data

  // Somebody with nothing left of their week. Read from the same rows the
  // Workload page shows, so the tile and that page cannot disagree.
  const overloaded = workload?.rows.filter((row) => row.remaining_hours < 0).length

  return (
    <div className="space-y-6">
      <CountSection
        title="Business overview"
        counts={[
          {
            label: "Clients",
            ...countFields(clients),
            href: "/admin/dashboard/clients",
            hint: activeClients.value === undefined ? undefined : `${activeClients.value} active`,
            icon: <Users className="size-5" />,
            tone: 1,
          },
          {
            label: "Projects",
            ...countFields(projects),
            href: "/admin/dashboard/projects",
            icon: <FolderKanban className="size-5" />,
            tone: 2,
          },
          {
            label: "Team",
            ...countFields(team),
            href: "/admin/dashboard/team-management",
            icon: <UsersRound className="size-5" />,
            tone: 3,
          },
          {
            label: "Tasks",
            ...queryFields(reportQuery, report?.total),
            href: "/admin/dashboard/tasks",
            hint: report ? `${report.done_count} finished` : undefined,
            icon: <ListChecks className="size-5" />,
            tone: 4,
          },
        ]}
      />

      <CountSection
        title="Financial"
        counts={[
          {
            label: "Balance",
            // Held, not earned. Per currency and never summed — adding dollars
            // to taka needs a rate, and a rate baked into a headline is a
            // number nobody can check.
            ...queryFields(dashboardQueryResult, money ? formatUsd(money.balance_by_currency.USD) : undefined),
            href: "/admin/dashboard/accounts",
            hint: money ? `and ${formatBdt(money.balance_by_currency.BDT)}` : undefined,
            icon: <Wallet className="size-5" />,
            tone: 1,
          },
          {
            label: "Income this month",
            ...queryFields(dashboardQueryResult, money ? formatUsd(money.month.revenue_usd) : undefined),
            href: "/admin/dashboard/transactions?kind=income",
            hint: money ? `${money.month.payment_count} payments received` : undefined,
            icon: <TrendingUp className="size-5" />,
            tone: 3,
          },
          {
            label: "Expenses this month",
            ...queryFields(dashboardQueryResult, money ? formatBdt(money.month.expense_bdt) : undefined),
            href: "/admin/dashboard/transactions?kind=expense",
            icon: <Receipt className="size-5" />,
            tone: 4,
          },
          {
            label: "Outstanding",
            ...queryFields(dashboardQueryResult, money ? formatUsd(money.outstanding_receivable_usd) : undefined),
            href: "/admin/dashboard/invoices",
            hint: "Invoiced and not yet received",
            icon: <ArrowDownLeft className="size-5" />,
            tone: 2,
          },
        ]}
      />

      <CountSection
        title="Operations"
        counts={[
          {
            label: "Active projects",
            ...queryFields(dashboardQueryResult, money?.active_projects),
            href: "/admin/dashboard/projects?status=Active",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
          {
            label: "Overdue tasks",
            ...queryFields(reportQuery, report?.overdue_count),
            href: "/admin/dashboard/tasks?overdue=true",
            hint: "Past their date and still open",
            icon: <AlertTriangle className="size-5" />,
            tone: 4,
          },
          {
            label: "Unassigned tasks",
            ...queryFields(reportQuery, report?.unassigned_count),
            href: "/admin/dashboard/tasks?unassigned=true",
            hint: "Nobody is doing these",
            icon: <ListChecks className="size-5" />,
            tone: 2,
          },
          {
            label: "Overloaded",
            ...queryFields(workloadQueryResult, overloaded),
            href: "/admin/dashboard/workload",
            hint: "More logged than they had hours for",
            icon: <UsersRound className="size-5" />,
            tone: 5,
          },
        ]}
      />
    </div>
  )
}

export default AdminOverview
