"use client"

import ProjectFormModal from "@/components/modules/Admin/Projects/ProjectFormModal"
import { projectsColumns } from "@/components/modules/Admin/Projects/projectsColumns"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getProjects } from "@/services/agencio.services"
import type { IProject } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

/**
 * The projects list.
 *
 * Every sub-view in the sidebar - Planning, Active, Review, On Hold, Completed,
 * My Projects - is this one table reading its filter off the URL. Built as six
 * pages it would be six copies of one query and six places to fix one bug.
 *
 * The status is matched by NAME because a sidebar href is a static string: an
 * id differs per agency, and category cannot tell Active from Review since both
 * are `active`.
 *
 * `canManage` decides whether this is a list somebody works from or one they
 * only read. Operations opens it to see the projects they are on — the API
 * returns only those — and refuses them every write behind it, so the create
 * and edit forms come off rather than failing.
 */
const ProjectsTable = ({ canManage = true }: { canManage?: boolean }) => {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState("")

  const status = params.get("status") ?? ""
  const mine = params.get("mine") === "true"

  const {
    editingItem,
    isEditModalOpen,
    onEditOpenChange,
    tableActions,
  } = useRowActionModalState<IProject>({ enableView: true, enableDelete: false })

  // Built the same way the page builds it, so the two agree on the cache key
  // and the first paint is the view that was asked for.
  const query = [
    search ? `search=${encodeURIComponent(search)}` : "",
    status ? `status=${encodeURIComponent(status)}` : "",
    mine ? "mine=true" : "",
  ]
    .filter(Boolean)
    .join("&")

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["projects", query],
    queryFn: () => getProjects(query || undefined),
  })

  const projects = (data?.data ?? []) as IProject[]

  return (
    <>
      <DataTable
        data={projects}
        columns={projectsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No projects yet."
        toolbarAction={canManage ? <ProjectFormModal /> : undefined}
        search={{
          initialValue: search,
          placeholder: "Search name, code or client...",
          onDebouncedChange: setSearch,
        }}
        // Delete is deliberately absent from the row menu: a project with
        // money against it cannot be deleted anyway, and marking it completed
        // or cancelled from the edit form is what actually happens.
        actions={{
          // Viewing stays for everybody; editing is dropped for anybody the
          // API would refuse, rather than offered and then rejected.
          ...(canManage ? tableActions : {}),
          onView: (project) => router.push(`/admin/dashboard/projects/${project.id}`),
        }}
      />

      {canManage && (
        <ProjectFormModal
          project={editingItem}
          open={isEditModalOpen}
          onOpenChange={onEditOpenChange}
        />
      )}
    </>
  )
}

export default ProjectsTable
