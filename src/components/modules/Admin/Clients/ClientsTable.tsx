"use client"

import ClientFormModal from "@/components/modules/Admin/Clients/ClientFormModal"
import DeleteClientDialog from "@/components/modules/Admin/Clients/DeleteClientDialog"
import { clientsColumns } from "@/components/modules/Admin/Clients/clientsColumns"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { getClients } from "@/services/agencio.services"
import type { IClient } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

/**
 * The client list, and its four sidebar entries.
 *
 * The filter comes from the URL rather than local state, so All / Active /
 * Inactive / Archived are four links to one board. Kept in the URL and not
 * in a chip row because that is what makes them linkable at all — and the
 * sidebar can then show which one you are on.
 *
 * Archived is a state, not a deletion: the client and its history stay, and
 * it drops out of the list somebody works from.
 */
const ClientsTable = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")

  const status = searchParams.get("status") ?? ""

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IClient>({ enableView: true })

  const query = [
    search ? `search=${encodeURIComponent(search)}` : "",
    status ? `status=${status}` : "",
  ]
    .filter(Boolean)
    .join("&")

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["clients", query],
    queryFn: () => getClients(query || undefined),
  })

  const clients = (data?.data ?? []) as IClient[]

  return (
    <>
      <DataTable
        data={clients}
        columns={clientsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage={
          status
            ? // Says which list is empty. "No clients yet" on a filtered view is a
              // lie about the business rather than a fact about the filter.
              `No ${status} clients.`
            : "No clients yet."
        }
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
