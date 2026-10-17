"use client"

import ProjectBaselineCard from "@/components/modules/Admin/Projects/ProjectBaselineCard"
import ProjectFinanceTiles from "@/components/modules/Admin/Projects/ProjectFinanceTiles"
import ProjectFormModal from "@/components/modules/Admin/Projects/ProjectFormModal"
import ProjectLinksPanel from "@/components/modules/Admin/Projects/ProjectLinksPanel"
import ProjectMilestonePanel from "@/components/modules/Admin/Projects/ProjectMilestonePanel"
import ProjectOverview from "@/components/modules/Admin/Projects/ProjectOverview"
import ProjectTasksPanel from "@/components/modules/Admin/Projects/ProjectTasksPanel"
import ProjectTeamPanel from "@/components/modules/Admin/Projects/ProjectTeamPanel"
import CredentialsPanel from "@/components/modules/Admin/Vault/CredentialsPanel"
import PageHeader from "@/components/shared/PageHeader"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import NotFoundState from "@/components/shared/state/NotFoundState"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDay } from "@/lib/dates"
import { projectDetailQuery, projectFinancialsQuery } from "@/queries/project.queries"
import { useQuery } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const PROJECTS_HREF = "/admin/dashboard/projects"

type ProjectDetailProps = {
  projectId: string
  canSeeMoney?: boolean
  /** Whether the panels that CHANGE a project appear. Admin and PM only. */
  canManage?: boolean
  /** Operations reads a project but cannot open its client's page or the Vault. */
  canOpenClient?: boolean
}

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
const ProjectDetail = ({ projectId, canSeeMoney = false, canManage = false, canOpenClient = false }: ProjectDetailProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const projectQuery = useQuery(projectDetailQuery(projectId))
  const { data: financeData } = useQuery({ ...projectFinancialsQuery(projectId), enabled: canSeeMoney })

  const project = projectQuery.data?.data
  const finance = financeData?.data

  // Null is the API saying there is no such project here: nothing to retry.
  if (projectQuery.data === null) {
    return <NotFoundState homeHref={PROJECTS_HREF} homeLabel="Back to projects" />
  }

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

  const clientName = project.client?.name ?? "No client"

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        breadcrumb={[{ label: "Projects", href: PROJECTS_HREF }]}
        actions={
          canManage && (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )
        }
      >
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge category={project.status.category} label={project.status.name} />
          <span>{project.code}</span>
          <span aria-hidden="true">·</span>
          {project.client && canOpenClient ? (
            <Link href={`/admin/dashboard/clients/${project.client.id}`} className="underline-offset-4 hover:underline">
              {clientName}
            </Link>
          ) : (
            <span>{clientName}</span>
          )}
          {project.start_date && <span>· started {formatDay(project.start_date)}</span>}
        </span>
      </PageHeader>

      {/* Undefined for anybody who may not see it, because the query never
          ran - not because a flag is checked in two places. */}
      {canSeeMoney && finance && <ProjectFinanceTiles finance={finance} />}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="vault">Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTasksPanel projectId={projectId} canManage={canManage} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4 space-y-4">
          {canManage && <ProjectBaselineCard projectId={projectId} />}
          <ProjectMilestonePanel projectId={projectId} canManage={canManage} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <ProjectTeamPanel projectId={projectId} canManage={canManage} />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <ProjectLinksPanel projectId={projectId} canManage={canManage} />
        </TabsContent>

        <TabsContent value="vault" className="mt-4">
          <CredentialsPanel
            filter={`project_id=${projectId}`}
            title="Credentials on this project"
            emptyMessage="Nothing stored against this project yet."
            canOpenVault={canOpenClient}
          />
        </TabsContent>
      </Tabs>

      {canManage && <ProjectFormModal project={project} open={isEditing} onOpenChange={setIsEditing} />}
    </div>
  )
}

export default ProjectDetail
