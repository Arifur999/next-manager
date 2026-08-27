"use client"

import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import { getDashboard } from "@/services/agencio.services"
import type { IDashboard } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowDownLeft, FileText, FolderKanban, Wallet } from "lucide-react"
import Link from "next/link"

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-destructive/12 text-destructive",
  high: "bg-chart-4/15 text-chart-4",
  medium: "bg-chart-2/15 text-chart-2",
  low: "bg-muted text-muted-foreground",
}

const EmptyRow = ({ children }: { children: React.ReactNode }) => (
  <p className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>
)

const DashboardOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
  })

  const dashboard = data?.data as IDashboard | undefined

  if (isLoading && !dashboard) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-32 animate-pulse bg-muted/40" />
        ))}
      </div>
    )
  }

  if (!dashboard) return null

  const usdBalance = dashboard.balance_by_currency?.USD ?? 0
  const bdtBalance = dashboard.balance_by_currency?.BDT ?? 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue this month"
          value={formatUsd(dashboard.month.revenue_usd)}
          // Shown as a separate line, never added to the USD figure — the two
          // are different currencies, and this one is a frozen reporting value
          // rather than what the money is worth today.
          secondary={`${formatBdt(dashboard.month.revenue_bdt_reporting)} at recorded rates`}
          hint={`${dashboard.month.payment_count} payment${dashboard.month.payment_count === 1 ? "" : "s"}`}
          icon={<ArrowDownLeft className="size-5" />}
          tone={1}
        />

        <StatTile
          label="Held across accounts"
          value={formatUsd(usdBalance)}
          secondary={formatBdt(bdtBalance)}
          hint="USD and BDT are held separately"
          icon={<Wallet className="size-5" />}
          tone={3}
        />

        <StatTile
          label="Outstanding receivables"
          value={formatUsd(dashboard.outstanding_receivable_usd)}
          hint={`${dashboard.overdue_invoices} invoice${dashboard.overdue_invoices === 1 ? "" : "s"} overdue`}
          icon={<FileText className="size-5" />}
          tone={4}
        />

        <StatTile
          label="Active projects"
          value={String(dashboard.active_projects)}
          secondary={`${formatBdt(dashboard.month.expense_bdt)} spent this month`}
          icon={<FolderKanban className="size-5" />}
          tone={2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="gap-0 overflow-hidden p-0 lg:col-span-2">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Account balances</CardTitle>
          </CardHeader>

          {dashboard.balances.length === 0 ? (
            <EmptyRow>
              No accounts yet.{" "}
              <Link href="/admin/dashboard/accounts" className="text-primary underline-offset-4 hover:underline">
                Add one
              </Link>
              .
            </EmptyRow>
          ) : (
            <ul className="divide-y">
              {dashboard.balances.map((account) => (
                <li key={account.accountId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.currency}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {account.currency === "USD"
                      ? formatUsd(account.balance)
                      : formatBdt(account.balance)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden p-0 lg:col-span-3">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Due today</CardTitle>
          </CardHeader>

          {dashboard.tasks_due_today.length === 0 ? (
            <EmptyRow>Nothing due today.</EmptyRow>
          ) : (
            <ul className="divide-y">
              {dashboard.tasks_due_today.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.project?.name ?? "No project"}
                      {task.assignee ? ` · ${task.assignee.full_name}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                      PRIORITY_TONE[task.priority] ?? PRIORITY_TONE.low
                    }`}
                  >
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>

        {dashboard.recent_activity.length === 0 ? (
          <EmptyRow>Nothing has happened yet.</EmptyRow>
        ) : (
          <ul className="divide-y">
            {dashboard.recent_activity.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{entry.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.user?.full_name ?? "System"} ·{" "}
                    {format(new Date(entry.created_at), "MMM dd, HH:mm")}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {entry.entity_type}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default DashboardOverview
