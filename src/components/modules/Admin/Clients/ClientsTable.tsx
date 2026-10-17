"use client"

import ClientFormModal from "@/components/modules/Admin/Clients/ClientFormModal"
import DeleteClientDialog from "@/components/modules/Admin/Clients/DeleteClientDialog"
import { clientsColumns } from "@/components/modules/Admin/Clients/clientsColumns"
import { CLIENTS_TABLE } from "@/components/modules/Admin/Clients/clientsTable.config"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { clientsListQuery } from "@/queries/crm.queries"
import type { IClient } from "@/types/crm.types"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

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
  const queryClient = useQueryClient()
  const { queryString, filterQueryString, dataTableProps } = useServerDataTable<IClient>(CLIENTS_TABLE)
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
        exportRows={async () => (await queryClient.fetchQuery(clientsListQuery(filterQueryString))).data}
        {...dataTableProps}
        {...toTableQueryProps(clientsQuery)}
        // Shown only when nothing narrows the list; a filtered view says so itself.
        emptyMessage="No clients yet."
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
