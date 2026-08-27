"use client"

import ProjectFormModal from "@/components/modules/Admin/Projects/ProjectFormModal"
import { projectsColumns } from "@/components/modules/Admin/Projects/projectsColumns"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getProjects } from "@/services/agencio.services"
import type { IProject } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ProjectsTable = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const {
    editingItem,
    isEditModalOpen,
    onEditOpenChange,
    tableActions,
  } = useRowActionModalState<IProject>({ enableView: true, enableDelete: false })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["projects", search],
    queryFn: () => getProjects(search ? `search=${encodeURIComponent(search)}` : undefined),
  })

  const projects = (data?.data ?? []) as IProject[]

  return (
    <>
      <DataTable
        data={projects}
        columns={projectsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No projects yet."
        toolbarAction={<ProjectFormModal />}
        search={{
          initialValue: search,
          placeholder: "Search name, code or client...",
          onDebouncedChange: setSearch,
        }}
        // Delete is deliberately absent from the row menu: a project with
        // money against it cannot be deleted anyway, and marking it completed
        // or cancelled from the edit form is what actually happens.
        actions={{
          ...tableActions,
          onView: (project) => router.push(`/admin/dashboard/projects/${project.id}`),
        }}
      />

      <ProjectFormModal
        project={editingItem}
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
      />
    </>
  )
}

export default ProjectsTable
