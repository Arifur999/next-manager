"use client"

import {
  createTemplateAction,
  deleteTemplateAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatUsd } from "@/lib/currency"
import { getServiceTemplates, getServices } from "@/services/agencio.services"
import type { IService, IServiceTemplate } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Boxes, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Named bundles, so a repeat offer is one pick rather than five.
 *
 * The total shown against a package is worked out from today's service prices
 * and labelled as an estimate — it is not stored, because what a bundle costs
 * is whatever its lines are actually sold at. Storing a second total would give
 * two answers to what the client owes.
 */
const TemplatesBoard = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [picked, setPicked] = useState<Record<string, number>>({})

  const { data, isLoading } = useQuery({
    queryKey: ["service-templates"],
    queryFn: () => getServiceTemplates(),
  })
  const { data: serviceData } = useQuery({ queryKey: ["services"], queryFn: () => getServices() })

  const templates = (data?.data ?? []) as IServiceTemplate[]
  const services = ((serviceData?.data ?? []) as IService[]).filter((service) => service.is_active)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["service-templates"] })

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      createTemplateAction({
        name: name.trim(),
        items: Object.entries(picked).map(([service_id, quantity]) => ({ service_id, quantity })),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not create it")
        return
      }
      toast.success("Package created")
      setName("")
      setPicked({})
      void refresh()
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteTemplateAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not remove it")
        return
      }
      toast.success("Package removed")
      void refresh()
    },
  })

  const toggle = (service: IService, on: boolean) => {
    const next = { ...picked }
    if (on) next[service.id] = 1
    else delete next[service.id]
    setPicked(next)
  }

  const chosen = Object.keys(picked).length

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New package</CardTitle>
        </CardHeader>

        <form
          className="space-y-4 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim() || chosen === 0) return
            create()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="template-name">Name</Label>
            <Input
              id="template-name"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              placeholder="Launch package"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>What is in it</Label>

            {services.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nothing to bundle yet —{" "}
                <Link
                  href="/admin/dashboard/services"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  add some services
                </Link>{" "}
                first.
              </p>
            ) : (
              <ul className="space-y-2">
                {services.map((service) => {
                  const on = service.id in picked

                  return (
                    <li key={service.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`pick-${service.id}`}
                        checked={on}
                        onCheckedChange={(checked) => toggle(service, checked === true)}
                        disabled={isPending}
                      />
                      <Label htmlFor={`pick-${service.id}`} className="flex-1 font-normal">
                        {service.name}
                        <span className="block text-xs text-muted-foreground">
                          {service.default_price_usd > 0
                            ? formatUsd(service.default_price_usd)
                            : "priced each time"}
                        </span>
                      </Label>

                      {on && (
                        <Input
                          type="number"
                          min={1}
                          step="1"
                          value={picked[service.id]}
                          onChange={(event) =>
                            setPicked({
                              ...picked,
                              [service.id]: Math.max(1, Number(event.target.value) || 1),
                            })
                          }
                          className="w-16"
                          aria-label={`How many of ${service.name}`}
                        />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !name.trim() || chosen === 0}
            className="w-full"
          >
            Create
          </Button>

          <p className="text-xs text-muted-foreground">
            A package has no price of its own. What it costs is whatever its lines are sold
            at on the day, so an invoice is never in two minds about the total.
          </p>
        </form>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Packages</CardTitle>
        </CardHeader>

        {isLoading && templates.length === 0 ? (
          <LoadingBlock />
        ) : templates.length === 0 ? (
          <EmptyState icon={Boxes}>No packages yet.</EmptyState>
        ) : (
          <ul className="divide-y">
            {templates.map((template) => {
              const estimate = template.items.reduce(
                (running, item) => running + item.quantity * item.service.default_price_usd,
                0
              )

              return (
                <li key={template.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-48 flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.items.length}{" "}
                        {template.items.length === 1 ? "service" : "services"}
                        {estimate > 0 && ` · about ${formatUsd(estimate)} at today's prices`}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(template.id)}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {template.items.map((item) => (
                      <Badge key={item.id} variant="secondary">
                        {item.quantity > 1 ? `${item.quantity} × ` : ""}
                        {item.service.name}
                        {!item.service.is_active && " (not sold)"}
                      </Badge>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default TemplatesBoard
