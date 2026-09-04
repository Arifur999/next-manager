"use client"

import CountSection from "@/components/shared/dashboard/CountSection"
import { useCount } from "@/components/shared/dashboard/useCount"
import { formatBdt, formatUsd } from "@/lib/currency"
import {
  getClients,
  getDashboard,
  getProjects,
  getTaskReport,
  getWorkload,
} from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IDashboard, ITaskReport, IWorkload } from "@/types/agencio.types"
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
  const clients = useCount(["clients", "count"], () => getClients("limit=1"))
  const activeClients = useCount(["clients", "count", "active"], () =>
    getClients("status=active&limit=1")
  )
  const projects = useCount(["projects", "count"], () => getProjects("limit=1"))
  const team = useCount(["users", "count"], () => getAllUsers("limit=1"))

  const { data: reportData } = useQuery({
    queryKey: ["task-report"],
    queryFn: () => getTaskReport(),
  })
  const report = reportData?.data as ITaskReport | undefined

  const { data: dashboardData } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() })
  const money = dashboardData?.data as IDashboard | undefined

  const { data: workloadData } = useQuery({ queryKey: ["workload"], queryFn: () => getWorkload() })
  const workload = workloadData?.data as IWorkload | undefined

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
            value: clients,
            href: "/admin/dashboard/clients",
            hint: activeClients === undefined ? undefined : `${activeClients} active`,
            icon: <Users className="size-5" />,
            tone: 1,
          },
          {
            label: "Projects",
            value: projects,
            href: "/admin/dashboard/projects",
            icon: <FolderKanban className="size-5" />,
            tone: 2,
          },
          {
            label: "Team",
            value: team,
            href: "/admin/dashboard/team-management",
            icon: <UsersRound className="size-5" />,
            tone: 3,
          },
          {
            label: "Tasks",
            value: report?.total,
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
            value: money ? formatUsd(money.balance_by_currency.USD) : undefined,
            href: "/admin/dashboard/accounts",
            hint: money ? `and ${formatBdt(money.balance_by_currency.BDT)}` : undefined,
            icon: <Wallet className="size-5" />,
            tone: 1,
          },
          {
            label: "Income this month",
            value: money ? formatUsd(money.month.revenue_usd) : undefined,
            href: "/admin/dashboard/transactions?kind=income",
            hint: money ? `${money.month.payment_count} payments received` : undefined,
            icon: <TrendingUp className="size-5" />,
            tone: 3,
          },
          {
            label: "Expenses this month",
            value: money ? formatBdt(money.month.expense_bdt) : undefined,
            href: "/admin/dashboard/transactions?kind=expense",
            icon: <Receipt className="size-5" />,
            tone: 4,
          },
          {
            label: "Outstanding",
            value: money ? formatUsd(money.outstanding_receivable_usd) : undefined,
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
            value: money?.active_projects,
            href: "/admin/dashboard/projects?status=Active",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
          {
            label: "Overdue tasks",
            value: report?.overdue_count,
            href: "/admin/dashboard/tasks?overdue=true",
            hint: "Past their date and still open",
            icon: <AlertTriangle className="size-5" />,
            tone: 4,
          },
          {
            label: "Unassigned tasks",
            value: report?.unassigned_count,
            href: "/admin/dashboard/tasks",
            hint: "Nobody is doing these",
            icon: <ListChecks className="size-5" />,
            tone: 2,
          },
          {
            label: "Overloaded",
            value: overloaded,
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
