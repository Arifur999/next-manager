"use client"

import { Button } from "@/components/ui/button"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getDepartments } from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IDepartment } from "@/types/agencio.types"
import { type IUser } from "@/types/user.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import CreateUserFormModal from "./CreateUserFormModal"
import DeleteUserConfirmationDialog from "./DeleteUserConfirmationDialog"
import EditUserFormModal from "./EditUserFormModal"
import { teamColumns } from "./teamColumns"

const ALL = "__all__"

const TeamTable = () => {
  const [department, setDepartment] = useState(ALL)

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IUser>({ enableView: false })

  // Filtered on the server, not in the table. The list is paginated, so
  // filtering the page that arrived would hide people rather than find them.
  const query = department === ALL ? "" : `department_id=${department}`

  const { data: usersResponse, isLoading, isFetching } = useQuery({
    queryKey: ["users", query],
    queryFn: () => getAllUsers(query),
  })

  const { data: departmentResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  })

  const users = usersResponse?.data ?? []
  const departments = ((departmentResponse?.data ?? []) as IDepartment[]).filter(
    (row) => row.is_active
  )

  return (
    <>
      {/* Only once there is something to filter by. A row of one chip that
          does nothing is worse than no row at all. */}
      {departments.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={department === ALL ? "default" : "outline"}
            onClick={() => setDepartment(ALL)}
            aria-pressed={department === ALL}
          >
            Everyone
          </Button>
          {departments.map((row) => (
            <Button
              key={row.id}
              type="button"
              size="sm"
              variant={department === row.id ? "default" : "outline"}
              onClick={() => setDepartment(row.id)}
              aria-pressed={department === row.id}
            >
              {row.name}
            </Button>
          ))}
        </div>
      )}

      <DataTable
        data={users}
        columns={teamColumns}
        // isFetching too, so a background refetch also shows the overlay -
        // otherwise a stale list looks settled while it is still updating.
        isLoading={isLoading || isFetching}
        emptyMessage="No team members yet."
        toolbarAction={<CreateUserFormModal />}
        actions={tableActions}
      />

      <EditUserFormModal open={isEditModalOpen} onOpenChange={onEditOpenChange} user={editingItem} />

      <DeleteUserConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        user={deletingItem}
      />
    </>
  )
}

export default TeamTable
