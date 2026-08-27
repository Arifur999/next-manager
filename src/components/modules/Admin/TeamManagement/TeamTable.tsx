"use client"

import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getAllUsers } from "@/services/user.services"
import { type IUser } from "@/types/user.types"
import { useQuery } from "@tanstack/react-query"
import CreateUserFormModal from "./CreateUserFormModal"
import DeleteUserConfirmationDialog from "./DeleteUserConfirmationDialog"
import EditUserFormModal from "./EditUserFormModal"
import { teamColumns } from "./teamColumns"

const TeamTable = () => {
  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IUser>({ enableView: false })

  const { data: usersResponse, isLoading, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  })

  const users = usersResponse?.data ?? []

  return (
    <>
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
