"use client"

import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBdt, formatPercent, formatUsd } from "@/lib/currency"
import { getCredentials, getProject, getProjectFinancials, getTasks } from "@/services/agencio.services"
import type { ICredential, IProject, IProjectFinancials, ITask } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowDownLeft, KeyRound, Receipt, TrendingUp } from "lucide-react"
import Link from "next/link"

const TASK_TONE: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-chart-2/15 text-chart-2",
  in_review: "bg-chart-4/15 text-chart-4",
  done: "bg-chart-3/15 text-chart-3",
}

const ProjectDetail = ({ projectId }: { projectId: string }) => {
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  })

  const { data: financeData } = useQuery({
    queryKey: ["project-financials", projectId],
    queryFn: () => getProjectFinancials(projectId),
  })

  const { data: tasksData } = useQuery({
    queryKey: ["tasks", `project_id=${projectId}`],
    queryFn: () => getTasks(`project_id=${projectId}`),
  })

  const { data: credentialsData } = useQuery({
    queryKey: ["credentials", `project_id=${projectId}`],
    queryFn: () => getCredentials(`project_id=${projectId}`),
  })

  const project = projectData?.data as (IProject & { tasks?: ITask[] }) | undefined
  const finance = financeData?.data as IProjectFinancials | undefined
  const tasks = ((tasksData?.data ?? []) as ITask[])
  const credentials = (credentialsData?.data ?? []) as ICredential[]

  if (isLoading && !project) {
    return <Card className="h-64 animate-pulse bg-muted/40" />
  }

  if (!project) return null

  const doneCount = tasks.filter((task) => task.status === "done").length
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant="outline">{project.code}</Badge>
            <Badge variant="outline" className="capitalize">
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.client ? (
              <Link
                href={`/admin/dashboard/clients`}
                className="underline-offset-4 hover:underline"
              >
                {project.client.name}
              </Link>
            ) : (
              "No client"
            )}
            {project.start_date && ` · started ${format(new Date(project.start_date), "MMM dd, yyyy")}`}
          </p>
        </div>
      </div>

      {finance && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Contract value"
            value={formatUsd(finance.contract_value_usd)}
            hint={`${formatUsd(finance.invoiced_usd)} invoiced`}
            tone={2}
          />
          <StatTile
            label="Received"
            value={formatUsd(finance.received_usd)}
            secondary={`${formatBdt(finance.received_bdt)} at recorded rates`}
            hint={`${formatUsd(finance.outstanding_usd)} still owed`}
            icon={<ArrowDownLeft className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Cost"
            value={formatBdt(finance.total_cost_bdt)}
            secondary={`${formatBdt(finance.team_cost_bdt)} team · ${formatBdt(finance.expense_bdt)} expenses`}
            icon={<Receipt className="size-5" />}
            tone={4}
          />
          <StatTile
            label="Profit"
            value={formatBdt(finance.profit_bdt)}
            // Money received minus money spent — not contract value minus cost,
            // because unpaid work is not profit.
            hint={
              finance.received_bdt > 0
                ? `${formatPercent((finance.profit_bdt / finance.received_bdt) * 100)} margin on what has been paid`
                : "Nothing received yet"
            }
            icon={<TrendingUp className="size-5" />}
            tone={3}
          />
        </div>
      )}

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-base">
                {doneCount} of {tasks.length} done
              </CardTitle>
              <Progress value={progress} className="mt-2 h-1.5" />
            </CardHeader>

            {tasks.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No tasks on this project yet.
              </p>
            ) : (
              <ul className="divide-y">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {task.assignee?.full_name ?? "Unassigned"}
                        {task.due_date && ` · due ${format(new Date(task.due_date), "MMM dd")}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                        TASK_TONE[task.status]
                      }`}
                    >
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <Card className="p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">{project.description || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Notes</dt>
                <dd className="mt-1 text-sm">{project.notes || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Timeline</dt>
                <dd className="mt-1 text-sm">
                  {project.start_date
                    ? format(new Date(project.start_date), "MMM dd, yyyy")
                    : "Not set"}
                  {" → "}
                  {project.end_date ? format(new Date(project.end_date), "MMM dd, yyyy") : "Open"}
                </dd>
              </div>
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="vault" className="mt-4">
          <Card className="gap-0 overflow-hidden p-0">
            <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
              <CardTitle className="text-base">Credentials on this project</CardTitle>
              <Link
                href="/admin/dashboard/vault"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Open the Vault
              </Link>
            </CardHeader>

            {credentials.length === 0 ? (
              <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
                <KeyRound className="size-7" aria-hidden="true" />
                Nothing stored against this project yet.
              </p>
            ) : (
              <ul className="divide-y">
                {credentials.map((credential) => (
                  <li
                    key={credential.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{credential.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {credential.username || "no username"}
                        {credential.url ? ` · ${credential.url}` : ""}
                      </p>
                    </div>

                    {/* Masked, and deliberately not revealable from here.
                        Revealing is logged against a person, so it belongs on
                        the Vault screen where that consequence is stated. */}
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {credential.password}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProjectDetail
