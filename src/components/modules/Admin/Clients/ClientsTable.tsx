"use client"

import ClientFormModal from "@/components/modules/Admin/Clients/ClientFormModal"
import DeleteClientDialog from "@/components/modules/Admin/Clients/DeleteClientDialog"
import { clientsColumns } from "@/components/modules/Admin/Clients/clientsColumns"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getClients } from "@/services/agencio.services"
import type { IClient } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ClientsTable = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IClient>({ enableView: true })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => getClients(search ? `search=${encodeURIComponent(search)}` : undefined),
  })

  const clients = (data?.data ?? []) as IClient[]

  return (
    <>
      <DataTable
        data={clients}
        columns={clientsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No clients yet."
        toolbarAction={<ClientFormModal />}
        search={{
          initialValue: search,
          placeholder: "Search name, company or email...",
          onDebouncedChange: setSearch,
        }}
        actions={{
          ...tableActions,
          onView: (client) => router.push(`/admin/dashboard/clients/${client.id}`),
        }}
      />

      <ClientFormModal client={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />

      <DeleteClientDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        client={deletingItem}
      />
    </>
  )
}

export default ClientsTable
