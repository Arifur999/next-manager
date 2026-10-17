"use client"

import {
  addClientLinkAction,
  removeClientLinkAction,
  updateClientLinkAction,
} from "@/app/(dashboardLayout)/admin/dashboard/clients/_linkAction"
import LinksPanel from "@/components/shared/links/LinksPanel"
import { queryKeys } from "@/lib/queryKeys"
import { clientLinksListQuery } from "@/queries/crm.queries"
import { clientLinkFormZodSchema } from "@/zod/crm.validation"
import { useQuery } from "@tanstack/react-query"

// `canManage` follows the API: admin, sales and project managers keep a client's links.
const ClientLinksPanel = ({ clientId, canManage = true }: { clientId: string; canManage?: boolean }) => {
  const linksQuery = useQuery(clientLinksListQuery(`client_id=${clientId}`))

  return (
    <LinksPanel
      owner="client"
      linksQuery={linksQuery}
      links={linksQuery.data?.data ?? []}
      formSchema={clientLinkFormZodSchema}
      invalidateKey={queryKeys.clientLinks.all}
      canManage={canManage}
      addLink={(values) => addClientLinkAction({ client_id: clientId, ...values })}
      updateLink={updateClientLinkAction}
      removeLink={removeClientLinkAction}
    />
  )
}

export default ClientLinksPanel
