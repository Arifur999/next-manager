"use client"

import ProjectBaselineCard from "@/components/modules/Admin/Projects/ProjectBaselineCard"
import ProjectFinanceTiles from "@/components/modules/Admin/Projects/ProjectFinanceTiles"
import ProjectMilestonePanel from "@/components/modules/Admin/Projects/ProjectMilestonePanel"
import ProjectTasksPanel from "@/components/modules/Admin/Projects/ProjectTasksPanel"
import ProjectTeamPanel from "@/components/modules/Admin/Projects/ProjectTeamPanel"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ITask } from "@/types/work.types"
import type { IProject } from "@/types/project.types"
import ProjectLinksPanel from "@/components/modules/Admin/Projects/ProjectLinksPanel"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { KeyRound } from "lucide-react"
import Link from "next/link"
import { projectDetailQuery, projectFinancialsQuery } from "@/queries/project.queries"
import { credentialsListQuery } from "@/queries/workspace.queries"

/**
 * One project, and how much of it somebody may see.
 *
 * A salesperson opens this to find out where a client they brought in has
 * got to. That is the tasks, the status and who is on it - never what the
 * work earns. `canSeeMoney` decides it, and when false the financials are not
 * hidden but UNFETCHED: /projects/:id/financials is admin and project-manager
 * only, so asking would produce an empty panel and a 403 for a question the
 * page already knew the answer to.
 */
const ProjectDetail = ({
  projectId,
  canSeeMoney = false,
  canManage = false,
}: {
  projectId: string
  canSeeMoney?: boolean
  /** Whether the panels that CHANGE a project appear. Admin and PM only. */
  canManage?: boolean
}) => {
  const projectQuery = useQuery(projectDetailQuery(projectId))

  const { data: financeData } = useQuery({ ...projectFinancialsQuery(projectId), enabled: canSeeMoney })

  const credentialsQuery = useQuery(credentialsListQuery(`project_id=${projectId}`))

  const project = projectQuery.data?.data as (IProject & { tasks?: ITask[] }) | undefined
  const finance = financeData?.data
  const credentials = credentialsQuery.data?.data ?? []

  // A failed refresh keeps the project it already has on screen; only a page
  // with nothing to show says it did not load.
  if (!project && projectQuery.isError) {
    return (
      <Card>
        <ErrorState
          message="This project did not load."
          onRetry={() => void projectQuery.refetch()}
          isRetrying={projectQuery.isFetching}
        />
      </Card>
    )
  }

  if (!project) {
    return (
      <Card className="overflow-hidden p-0">
        <LoadingBlock height="h-64" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant="outline">{project.code}</Badge>
            <Badge variant="outline" className="capitalize">
              {project.status.name}
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

      {/* Undefined for anybody who may not see it, because the query never
          ran - not because a flag is checked in two places. */}
      {canSeeMoney && finance && <ProjectFinanceTiles finance={finance} />}

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTasksPanel projectId={projectId} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4 space-y-4">
          {canManage && <ProjectBaselineCard projectId={projectId} />}
          <ProjectMilestonePanel projectId={projectId} canManage={canManage} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <ProjectTeamPanel projectId={projectId} canManage={canManage} />
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

        <TabsContent value="links" className="mt-4">
          <ProjectLinksPanel projectId={projectId} canManage={canManage} />
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

            <PanelState
              query={credentialsQuery}
              errorMessage="The vault entries did not load."
              isEmpty={credentials.length === 0}
              empty={<EmptyState icon={KeyRound}>Nothing stored against this project yet.</EmptyState>}
            >
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
            </PanelState>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProjectDetail
