"use client"

import { ALL_STAGES } from "@/components/modules/Admin/Leads/stages"
import { createLeadAction } from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getLeadSources } from "@/services/agencio.services"
import type { ILeadSource, LeadStage } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  // An id now, not typed text - see LeadSource on the server for why. Empty
  // string means nobody said, which is a real answer.
  source_id: z.string().optional(),
  stage: z.enum(["new", "contacted", "proposal", "negotiating", "won", "lost"]),
  estimated_value_usd: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
      "Estimated value must be a number that is not negative",
    ),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

// Only the open stages get a column. Won and lost are outcomes, not places work
// sits, and giving them columns would make the board grow forever.
const CreateLeadModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: sourcesData } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => getLeadSources(),
    enabled: open,
  })

  // Retired marketplaces stay out of the picker but keep their history on the
  // leads that already point at them.
  const activeSources = ((sourcesData?.data ?? []) as ILeadSource[]).filter(
    (source) => source.is_active,
  )

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: LeadFormValues) =>
      createLeadAction({
        ...values,
        estimated_value_usd: values.estimated_value_usd ? Number(values.estimated_value_usd) : 0,
        // An empty pick means "nobody said", which the API models as null
        // rather than as an empty string.
        source_id: values.source_id || null,
      }),
  })

  const defaultValues: LeadFormValues = {
    name: "",
    company: "",
    email: "",
    phone: "",
    source_id: "",
    stage: "new",
    estimated_value_usd: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to create lead")
        return
      }

      toast.success("Lead added")
      setOpen(false)
      form.reset()
      void queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          Add lead
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>A deal that has not been won yet.</DialogDescription>
        </DialogHeader>

        <form
          method="POST"
          action="#"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <form.Field name="name" validators={{ onChange: leadFormSchema.shape.name }}>
            {(field) => <AppField field={field} label="Name" disabled={isPending} />}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="company">
              {(field) => <AppField field={field} label="Company" disabled={isPending} />}
            </form.Field>

            <form.Field name="source_id">
              {(field) => (
                <EntitySelect
                  id={field.name}
                  label="Where it came from"
                  value={field.state.value ?? ""}
                  onChange={field.handleChange}
                  disabled={isPending}
                  placeholder="Not recorded"
                  emptyMessage="No marketplaces set up yet"
                  options={activeSources.map((source) => ({
                    value: source.id,
                    label: source.name,
                  }))}
                />
              )}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="email" validators={{ onChange: leadFormSchema.shape.email }}>
              {(field) => <AppField field={field} label="Email" type="email" disabled={isPending} />}
            </form.Field>

            <form.Field name="phone">
              {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="stage">
              {(field) => (
                <EntitySelect
                  id={field.name}
                  label="Stage"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as LeadStage)}
                  disabled={isPending}
                  options={ALL_STAGES.map((stage) => ({
                    value: stage,
                    label: stage.charAt(0).toUpperCase() + stage.slice(1),
                  }))}
                />
              )}
            </form.Field>

            <form.Field name="estimated_value_usd">
              {(field) => (
                <AppField
                  field={field}
                  label="Estimated value (USD)"
                  type="number"
                  placeholder="0.00"
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
              Add lead
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateLeadModal
