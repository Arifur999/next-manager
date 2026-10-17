"use client"

import {
  deleteServiceAction,
  setServiceActiveAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import ServiceFormCard from "@/components/modules/Admin/Services/ServiceFormCard"
import ServiceList from "@/components/modules/Admin/Services/ServiceList"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IService } from "@/types/catalog.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { serviceCategoriesQuery, servicesListQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * The catalogue: a form on the left, the list on the right.
 *
 * This component only holds the state the two halves share. The form and the
 * list are their own files, so neither grows the other.
 */
/**
 * The catalogue.
 *
 * `canManage` decides whether this is a board somebody shapes or one they only
 * read. A project manager picks what a project delivers and needs to see what
 * is on offer; shaping the list is the seller's job, and the API refuses them
 * every write behind it — so offering the form would only be a form that fails.
 */
const ServicesBoard = ({ canManage = true }: { canManage?: boolean }) => {
  const [editing, setEditing] = useState<IService | null>(null)
  const [removing, setRemoving] = useState<IService | null>(null)

  const serviceList = useQuery(servicesListQuery())
  const { data: categoryData } = useQuery(serviceCategoriesQuery())

  const services = serviceList.data?.data ?? []
  const categories = categoryData?.data ?? []

  // No toast: the row's "not sold" badge is the confirmation.
  const { run: toggleSold } = useActionMutation({
    action: (service: IService) => setServiceActiveAction(service.id, { is_active: !service.is_active }),
    successMessage: false,
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
  })

  const { run: removeService, isPending: isRemoving } = useActionMutation({
    action: deleteServiceAction,
    successMessage: "Removed from the catalogue",
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
  })

  // The dialog stays open on a refusal, so "turn it off instead" is read in place.
  const confirmRemove = async () => {
    if (!removing) return
    const isRemoved = await removeService(removing.id)
    if (!isRemoved) return

    // Only the service being edited takes the form with it.
    if (editing?.id === removing.id) setEditing(null)
    setRemoving(null)
  }

  return (
    <div
      className={
        canManage
          ? "grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
          : "grid gap-4"
      }
    >
      {canManage && (
        // Keyed on the service, so choosing another one starts the form from its values.
        <ServiceFormCard
          key={editing?.id ?? "new"}
          service={editing}
          categories={categories}
          onDone={() => setEditing(null)}
        />
      )}

      <ServiceList
        services={services}
        query={serviceList}
        onEdit={setEditing}
        onEditable={canManage}
        onToggle={(service) => void toggleSold(service)}
        onDelete={setRemoving}
      />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remove this service?"
        description={
          <>
            This takes <span className="font-medium text-foreground">{removing?.name}</span> off the
            catalogue. A service on invoices, projects or packages cannot be removed: turn it off
            instead, so their history survives.
          </>
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void confirmRemove()}
      />
    </div>
  )
}

export default ServicesBoard
