"use client"

import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import ServiceFormCard, {
  NO_CATEGORY,
  emptyService,
  type ServiceDraft,
} from "@/components/modules/Admin/Services/ServiceFormCard"
import ServiceList from "@/components/modules/Admin/Services/ServiceList"
import { getServiceCategories, getServices } from "@/services/agencio.services"
import type { IService, IServiceCategory } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The catalogue: a form on the left, the list on the right.
 *
 * This component only holds the state the two halves share. The form and the
 * list are their own files, so neither grows the other.
 */
const ServicesBoard = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ServiceDraft>(emptyService)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: () => getServices() })
  const { data: categoryData } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => getServiceCategories(),
  })

  const services = (data?.data ?? []) as IService[]
  const categories = (categoryData?.data ?? []) as IServiceCategory[]

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["services"] })
  const reset = () => {
    setDraft(emptyService)
    setEditingId(null)
  }

  const payload = () => ({
    name: draft.name.trim(),
    description: draft.description.trim(),
    category_id: draft.category_id === NO_CATEGORY ? null : draft.category_id,
    // An empty box means "type it each time", which is zero rather than a
    // missing value the API would reject.
    default_price_usd: draft.default_price_usd ? Number(draft.default_price_usd) : 0,
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      editingId ? updateServiceAction(editingId, payload()) : createServiceAction(payload()),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save it")
        return
      }
      toast.success(editingId ? "Service updated" : "Added to the catalogue")
      reset()
      void refresh()
    },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (service: IService) =>
      updateServiceAction(service.id, { is_active: !service.is_active }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not change it")
        return
      }
      void refresh()
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (service: IService) => deleteServiceAction(service.id),
    onSuccess: (result) => {
      if (!result.success) {
        // The server names what is riding on it and says to turn it off
        // instead, which is more use than a shorter sentence.
        toast.error(result.message || "Could not remove it")
        return
      }
      toast.success("Removed from the catalogue")
      if (editingId) reset()
      void refresh()
    },
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <ServiceFormCard
        draft={draft}
        categories={categories}
        editing={Boolean(editingId)}
        isPending={isPending}
        onChange={setDraft}
        onSubmit={save}
        onCancel={reset}
      />

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
        onToggle={toggle}
        onDelete={remove}
      />
    </div>
  )
}

export default ServicesBoard
