"use client"

import ProjectFormModal from "@/components/modules/Admin/Projects/ProjectFormModal"
import { projectsColumns } from "@/components/modules/Admin/Projects/projectsColumns"
import { PROJECTS_TABLE } from "@/components/modules/Admin/Projects/projectsTable.config"
import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { projectsListQuery } from "@/queries/project.queries"
import { workflowStatusesListQuery } from "@/queries/work.queries"
import type { IProject } from "@/types/project.types"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

/**
 * The projects list. Every sidebar sub-view (Planning, Active, Review, On
 * Hold, Completed, My Projects) is this one table reading its filter from the
 * URL, where paging and search live too.
 *
 * `canManage` decides whether the create and edit forms are offered. Operations
 * opens the list to see the projects they are on (the API returns only those)
 * and is refused every write, so the forms come off rather than failing.
 */
const ProjectsTable = ({ canManage = true }: { canManage?: boolean }) => {
  const router = useRouter()
  const { data: statusData } = useQuery(workflowStatusesListQuery("kind=project"))

  // The agency's own statuses, matched by name like the sidebar links.
  const tableConfig = useMemo(() => {
    const statusFilter: DataTableFilterConfig = {
      id: "status",
      type: "single-select",
      label: "Status",
      options: (statusData?.data ?? []).map((status) => ({ label: status.name, value: status.name })),
    }
    return { ...PROJECTS_TABLE, filters: [statusFilter] }
  }, [statusData])

  const queryClient = useQueryClient()
  const { queryString, filterQueryString, dataTableProps } = useServerDataTable<IProject>(tableConfig)
  const projectsQuery = useQuery({ ...projectsListQuery(queryString), placeholderData: keepPreviousData })

  const { editingItem, isEditModalOpen, onEditOpenChange, tableActions } = useRowActionModalState<IProject>({
    enableView: true,
    enableDelete: false,
  })

  return (
    <>
      <DataTable
        data={projectsQuery.data?.data ?? []}
        columns={projectsColumns}
        tableId="projects"
        exportFileName="projects"
        exportRows={async () => (await queryClient.fetchQuery(projectsListQuery(filterQueryString))).data}
        {...dataTableProps}
        {...toTableQueryProps(projectsQuery)}
        emptyMessage="No projects yet."
        toolbarAction={canManage ? <ProjectFormModal /> : undefined}
        // No Delete in the row menu: a project with money against it cannot be
        // deleted, and completing or cancelling it from the form is what happens.
        actions={{
          ...(canManage ? tableActions : {}),
          onView: (project) => router.push(`/admin/dashboard/projects/${project.id}`),
        }}
      />

      {canManage && <ProjectFormModal project={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />}
    </>
  )
}

export default ProjectsTable
