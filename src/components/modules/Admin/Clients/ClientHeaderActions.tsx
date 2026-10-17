"use client"

import ClientFormModal from "@/components/modules/Admin/Clients/ClientFormModal"
import ProjectFormModal from "@/components/modules/Admin/Projects/ProjectFormModal"
import { Button } from "@/components/ui/button"
import type { IClient } from "@/types/crm.types"
import { FileText, Pencil } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

/** What the reader's role may do from a client's page, decided by the page as the API decides it. */
export type ClientAbilities = {
  /** Admin and sales. */
  canEdit: boolean
  /** Admin, sales and project managers. */
  canAddProject: boolean
  /** Admin and sales. */
  canRaiseInvoice: boolean
}

// The client page's own buttons: change the client, start work for them, bill them.
const ClientHeaderActions = ({ client, canEdit, canAddProject, canRaiseInvoice }: ClientAbilities & { client: IClient }) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      {canEdit && (
        <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
      )}

      {/* The invoice form picks its client itself; this opens the invoices page it lives on. */}
      {canRaiseInvoice && (
        <Button asChild variant="outline">
          <Link href="/admin/dashboard/invoices">
            <FileText className="size-4" />
            Raise invoice
          </Link>
        </Button>
      )}

      {canAddProject && <ProjectFormModal clientId={client.id} />}

      {canEdit && <ClientFormModal client={client} open={isEditing} onOpenChange={setIsEditing} />}
    </>
  )
}

export default ClientHeaderActions
