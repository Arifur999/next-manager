"use client"

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
import { useActionMutation } from "@/hooks/useActionMutation"
import { LEAD_STAGES } from "@/types/crm.types"
import { leadFormZodSchema, type ILeadFormValues } from "@/zod/crm.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { leadSourcesQuery } from "@/queries/crm.queries"
import { queryKeys } from "@/lib/queryKeys"

const emptyLead: ILeadFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source_id: "",
  stage: "new",
  estimated_value_usd: "",
}

const CreateLeadModal = () => {
  const [open, setOpen] = useState(false)

  const { data: sourcesData } = useQuery({ ...leadSourcesQuery(), enabled: open })

  // Retired marketplaces stay out of the picker but keep their history on the
  // leads that already point at them.
  const activeSources = (sourcesData?.data ?? []).filter((source) => source.is_active)

  const { run: addLead, isPending } = useActionMutation({
    action: createLeadAction,
    successMessage: "Lead added",
    invalidateKeys: [queryKeys.leads.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyLead,
    onSubmit: async ({ value }) => {
      if (await addLead(value)) {
        setOpen(false)
        form.reset()
      }
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
          <form.Field name="name" validators={{ onChange: leadFormZodSchema.shape.name }}>
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
            <form.Field name="email" validators={{ onChange: leadFormZodSchema.shape.email }}>
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
                  onChange={field.handleChange}
                  disabled={isPending}
                  options={LEAD_STAGES.map((stage) => ({
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
