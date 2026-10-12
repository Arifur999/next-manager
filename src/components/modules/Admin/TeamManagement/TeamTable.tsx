"use client"

import { Button } from "@/components/ui/button"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { type IUser } from "@/types/user.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import CreateUserFormModal from "./CreateUserFormModal"
import DeleteUserConfirmationDialog from "./DeleteUserConfirmationDialog"
import EditUserFormModal from "./EditUserFormModal"
import { teamColumns } from "./teamColumns"
import { departmentsQuery, usersListQuery } from "@/queries/people.queries"

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

  const { data: usersResponse, isLoading, isFetching, isError, refetch } = useQuery(usersListQuery(query))

  const { data: departmentResponse } = useQuery(departmentsQuery())

  const users = usersResponse?.data ?? []
  const departments = ((departmentResponse?.data ?? [])).filter(
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
        isError={isError}
        onRetry={() => refetch()}
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
