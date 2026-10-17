"use client"

import ClientFormModal from "@/components/modules/Admin/Clients/ClientFormModal"
import DeleteClientDialog from "@/components/modules/Admin/Clients/DeleteClientDialog"
import { clientsColumns } from "@/components/modules/Admin/Clients/clientsColumns"
import { CLIENTS_TABLE } from "@/components/modules/Admin/Clients/clientsTable.config"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { pickAllowed } from "@/lib/queryString"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { clientsListQuery } from "@/queries/crm.queries"
import { CLIENT_STATUSES, type IClient } from "@/types/crm.types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * The client list. Paging, search and the status filter live in the URL, so
 * the sidebar's All / Active / Inactive / Archived entries are links to views
 * of this one table.
 *
 * `canManage` hides the create, edit and delete controls; `canOpen` hides the
 * link to a client page. Operations gets neither: the API returns only the
 * clients whose projects they are on.
 */
const ClientsTable = ({ canManage = true, canOpen = true }: { canManage?: boolean; canOpen?: boolean }) => {
  const router = useRouter()
  const status = pickAllowed(useSearchParams().get("status"), CLIENT_STATUSES)
  const { queryString, dataTableProps } = useServerDataTable<IClient>(CLIENTS_TABLE)
  const clientsQuery = useQuery({ ...clientsListQuery(queryString), placeholderData: keepPreviousData })

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IClient>({ enableView: true })

  return (
    <>
      <DataTable
        data={clientsQuery.data?.data ?? []}
        columns={clientsColumns}
        tableId="clients"
        exportFileName="clients"
        {...dataTableProps}
        {...toTableQueryProps(clientsQuery)}
        // Names the filtered list: "No clients yet" on the archived view would be untrue.
        emptyMessage={status ? `No ${status} clients.` : "No clients yet."}
        toolbarAction={canManage ? <ClientFormModal /> : undefined}
        actions={{
          ...(canManage ? tableActions : {}),
          ...(canOpen ? { onView: (client: IClient) => router.push(`/admin/dashboard/clients/${client.id}`) } : {}),
        }}
      />

      {canManage && (
        <>
          <ClientFormModal client={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />
          <DeleteClientDialog open={isDeleteDialogOpen} onOpenChange={onDeleteOpenChange} client={deletingItem} />
        </>
      )}
    </>
  )
}

export default ClientsTable
