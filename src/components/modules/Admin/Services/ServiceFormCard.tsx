"use client"

import {
  createServiceAction,
  updateServiceAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IService, IServiceCategory } from "@/types/catalog.types"
import { NO_CATEGORY, serviceFormZodSchema, type IServiceFormValues } from "@/zod/catalog.validation"
import { useForm } from "@tanstack/react-form"
import { Plus, X } from "lucide-react"

// Adding or editing a service. The price is labelled a starting point because
// every invoice line keeps its own copy, so changing it never restates one sent.

const emptyService: IServiceFormValues = {
  name: "",
  description: "",
  category_id: NO_CATEGORY,
  default_price_usd: "",
}

// A price of zero means "type it each time", so it opens as an empty box.
const toServiceFormValues = (service: IService | null): IServiceFormValues =>
  service
    ? {
        name: service.name,
        description: service.description,
        category_id: service.category?.id ?? NO_CATEGORY,
        default_price_usd: service.default_price_usd ? String(service.default_price_usd) : "",
      }
    : emptyService

const ServiceFormCard = ({
  service,
  categories,
  onDone,
}: {
  /** The service being edited, or null to add a new one. */
  service: IService | null
  categories: IServiceCategory[]
  onDone: () => void
}) => {
  const { run: saveService, isPending } = useActionMutation({
    action: (values: IServiceFormValues) =>
      service ? updateServiceAction(service.id, values) : createServiceAction(values),
    successMessage: service ? "Service updated" : "Added to the catalogue",
    invalidateKeys: [queryKeys.services.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: toServiceFormValues(service),
    validators: { onSubmit: serviceFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await saveService(value)) {
        formApi.reset()
        onDone()
      }
    },
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{service ? "Edit service" : "New service"}</CardTitle>
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
              <Label htmlFor="service-name">Name</Label>
              <Input
                id="service-name"
                value={field.state.value}
                maxLength={80}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Logo design"
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="service-description">What it includes</Label>
              <Input
                id="service-description"
                value={field.state.value}
                maxLength={300}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Optional"
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="category_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="service-category">Category</Label>
              <Select value={field.state.value} onValueChange={field.handleChange} disabled={isPending}>
                <SelectTrigger id="service-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>Ungrouped</SelectItem>
                  {categories
                    .filter((category) => category.is_active)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="default_price_usd">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="service-price">Usual price</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="0.00"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A starting point. Every invoice keeps the price it was written with, so
                changing this never alters one already sent. Leave it empty to type the
                number each time.
              </p>
            </div>
          )}
        </form.Field>

        <div className="flex items-center gap-2">
          <form.Subscribe selector={(state) => state.values.name.trim() === ""}>
            {(isNameBlank) => (
              <Button type="submit" disabled={isPending || isNameBlank} className="flex-1">
                <Plus className="size-4" />
                {service ? "Save changes" : "Add"}
              </Button>
            )}
          </form.Subscribe>
          {service && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDone}
              aria-label="Stop editing"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

export default ServiceFormCard
