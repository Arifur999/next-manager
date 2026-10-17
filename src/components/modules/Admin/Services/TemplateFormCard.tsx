"use client"

import {
  createTemplateAction,
  updateTemplateAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatUsd } from "@/lib/currency"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IServiceTemplate } from "@/types/catalog.types"
import { serviceTemplateFormZodSchema, type IServiceTemplateFormValues } from "@/zod/catalog.validation"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { servicesListQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"

const newPackage: IServiceTemplateFormValues = { name: "", quantities: {} }

// Picking a service puts one of it in the package; unpicking takes it out.
const withPick = (quantities: Record<string, number>, serviceId: string, isPicked: boolean) => {
  const next = { ...quantities }
  if (isPicked) next[serviceId] = 1
  else delete next[serviceId]
  return next
}

const toFormValues = (template: IServiceTemplate): IServiceTemplateFormValues => ({
  name: template.name,
  quantities: Object.fromEntries(template.items.map((item) => [item.service.id, item.quantity])),
})

type TemplateFormCardProps = {
  /** Present to edit that package; absent to put a new one together. */
  template?: IServiceTemplate | null
  /** Leaves edit mode, after a save or a cancel. */
  onDone?: () => void
}

// Putting a package together from the services still on sale, or changing one.
const TemplateFormCard = ({ template, onDone }: TemplateFormCardProps) => {
  const serviceList = useQuery(servicesListQuery())
  // A service taken off sale stays offered on a package that already holds it,
  // so editing the name does not quietly drop a line.
  const services = (serviceList.data?.data ?? []).filter(
    (service) => service.is_active || template?.items.some((item) => item.service.id === service.id),
  )

  const { run: savePackage, isPending } = useActionMutation({
    action: (values: IServiceTemplateFormValues) =>
      template ? updateTemplateAction(template.id, values) : createTemplateAction(values),
    successMessage: template ? "Package updated" : "Package created",
    invalidateKeys: [queryKeys.serviceTemplates.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: template ? toFormValues(template) : newPackage,
    validators: { onSubmit: serviceTemplateFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!(await savePackage(value))) return
      formApi.reset()
      onDone?.()
    },
  })

  const isIncomplete = useStore(
    form.store,
    (state) => state.values.name.trim() === "" || Object.keys(state.values.quantities).length === 0,
  )

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{template ? `Edit ${template.name}` : "New package"}</CardTitle>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={field.state.value}
                maxLength={80}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Launch package"
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

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
            <form.Field name="quantities">
              {(field) => (
                <ul className="space-y-2">
                  {services.map((service) => {
                    const quantity = field.state.value[service.id]
                    const isPicked = quantity !== undefined

                    return (
                      <li key={service.id} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`pick-${service.id}`}
                          checked={isPicked}
                          onCheckedChange={(checked) =>
                            field.handleChange(withPick(field.state.value, service.id, checked === true))
                          }
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

                        {isPicked && (
                          <Input
                            type="number"
                            min={1}
                            step="1"
                            value={quantity}
                            onChange={(event) =>
                              field.handleChange({
                                ...field.state.value,
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
            </form.Field>
          )}
        </div>

        <div className="flex gap-2">
          {template && (
            <Button type="button" variant="outline" disabled={isPending} onClick={onDone} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending || isIncomplete} className="flex-1">
            {template ? "Save changes" : "Create"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          A package has no price of its own. What it costs is whatever its lines are sold
          at on the day, so an invoice is never in two minds about the total.
        </p>
      </form>
    </Card>
  )
}

export default TemplateFormCard
