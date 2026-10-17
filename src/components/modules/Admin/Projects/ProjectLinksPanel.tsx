"use client"

import {
  addProjectLinkAction,
  removeProjectLinkAction,
  updateProjectLinkAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_linkAction"
import LinksPanel from "@/components/shared/links/LinksPanel"
import { queryKeys } from "@/lib/queryKeys"
import { projectLinksListQuery } from "@/queries/project.queries"
import { projectLinkFormZodSchema } from "@/zod/project.validation"
import { useQuery } from "@tanstack/react-query"

// `canManage` follows the API: admin and project managers keep a project's links.
const ProjectLinksPanel = ({ projectId, canManage = true }: { projectId: string; canManage?: boolean }) => {
  const linksQuery = useQuery(projectLinksListQuery(`project_id=${projectId}`))

  return (
    <LinksPanel
      owner="project"
      linksQuery={linksQuery}
      links={linksQuery.data?.data ?? []}
      formSchema={projectLinkFormZodSchema}
      invalidateKey={queryKeys.projectLinks.all}
      canManage={canManage}
      addLink={(values) => addProjectLinkAction({ project_id: projectId, ...values })}
      updateLink={updateProjectLinkAction}
      removeLink={removeProjectLinkAction}
    />
  )
}

export default ProjectLinksPanel
