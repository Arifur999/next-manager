"use client"

import {
  createServiceAction,
  deleteServiceAction,
  setServiceActiveAction,
  updateServiceAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import ServiceFormCard, {
  emptyService,
  type ServiceDraft,
} from "@/components/modules/Admin/Services/ServiceFormCard"
import ServiceList from "@/components/modules/Admin/Services/ServiceList"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IService } from "@/types/catalog.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { serviceCategoriesQuery, servicesListQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"
import { NO_CATEGORY } from "@/zod/catalog.validation"

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
  const [draft, setDraft] = useState<ServiceDraft>(emptyService)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery(servicesListQuery())
  const { data: categoryData } = useQuery(serviceCategoriesQuery())

  const services = data?.data ?? []
  const categories = categoryData?.data ?? []

  const reset = () => {
    setDraft(emptyService)
    setEditingId(null)
  }

  const { run: saveService, isPending } = useActionMutation({
    action: (values: ServiceDraft) =>
      editingId ? updateServiceAction(editingId, values) : createServiceAction(values),
    successMessage: editingId ? "Service updated" : "Added to the catalogue",
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
  })

  // No toast: the row's "not sold" badge is the confirmation.
  const { run: toggleSold } = useActionMutation({
    action: (service: IService) => setServiceActiveAction(service.id, { is_active: !service.is_active }),
    successMessage: false,
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
  })

  const { run: removeService } = useActionMutation({
    action: (service: IService) => deleteServiceAction(service.id),
    successMessage: "Removed from the catalogue",
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
    onSuccess: () => {
      if (editingId) reset()
    },
  })

  const handleSave = async () => {
    if (await saveService(draft)) reset()
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
      <ServiceFormCard
        draft={draft}
        categories={categories}
        editing={Boolean(editingId)}
        isPending={isPending}
        onChange={setDraft}
        onSubmit={() => void handleSave()}
        onCancel={reset}
      />
      )}

      <ServiceList
        services={services}
        isLoading={isLoading}
        onEdit={(service) => {
          setEditingId(service.id)
          setDraft({
            name: service.name,
            description: service.description,
            category_id: service.category?.id ?? NO_CATEGORY,
            default_price_usd: service.default_price_usd
              ? String(service.default_price_usd)
              : "",
          })
        }}
        onEditable={canManage}
        onToggle={(service) => void toggleSold(service)}
        onDelete={(service) => void removeService(service)}
      />
    </div>
  )
}

export default ServicesBoard
