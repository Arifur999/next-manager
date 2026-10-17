"use client"

import { createLeadAction, updateLeadAction } from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import AppTextarea from "@/components/shared/form/AppTextarea"
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
import { queryKeys } from "@/lib/queryKeys"
import { sentenceCase } from "@/lib/text"
import { leadSourcesQuery } from "@/queries/crm.queries"
import { usersListQuery } from "@/queries/people.queries"
import { LEAD_STAGES, type ILead } from "@/types/crm.types"
import { leadFormZodSchema, type ILeadFormValues } from "@/zod/crm.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

const emptyLead: ILeadFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source_id: "",
  stage: "new",
  estimated_value_usd: "",
  notes: "",
  owner_id: "",
}

const toFormValues = (lead: ILead): ILeadFormValues => ({
  name: lead.name,
  company: lead.company ?? "",
  email: lead.email ?? "",
  phone: lead.phone ?? "",
  source_id: lead.source_id ?? "",
  stage: lead.stage,
  estimated_value_usd: String(lead.estimated_value_usd),
  notes: lead.notes ?? "",
  owner_id: lead.owner_id ?? "",
})

const LeadForm = ({ lead, onDone }: { lead?: ILead | null; onDone: () => void }) => {
  const { data: sourcesData } = useQuery(leadSourcesQuery())
  const { data: usersData } = useQuery(usersListQuery())

  // Retired marketplaces stay out of the picker but keep their history on the
  // leads that already point at them, including the one being edited.
  const sources = (sourcesData?.data ?? []).filter(
    (source) => source.is_active || source.id === lead?.source_id,
  )
  const people = usersData?.data ?? []

  const { run: saveLead, isPending } = useActionMutation({
    action: (values: ILeadFormValues) => (lead ? updateLeadAction(lead.id, values) : createLeadAction(values)),
    successMessage: lead ? "Lead updated" : "Lead added",
    invalidateKeys: [queryKeys.leads.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: lead ? toFormValues(lead) : emptyLead,
    onSubmit: async ({ value }) => {
      if (await saveLead(value)) onDone()
    },
  })

  return (
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
        {(field) => <AppField field={field} label="Name" autoComplete="off" disabled={isPending} />}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="company">
          {(field) => <AppField field={field} label="Company" autoComplete="off" disabled={isPending} />}
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
              options={sources.map((source) => ({ value: source.id, label: source.name }))}
            />
          )}
        </form.Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="email" validators={{ onChange: leadFormZodSchema.shape.email }}>
          {(field) => (
            <AppField field={field} label="Email" type="email" autoComplete="off" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => <AppField field={field} label="Phone" type="tel" autoComplete="off" disabled={isPending} />}
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
              options={LEAD_STAGES.map((stage) => ({ value: stage, label: sentenceCase(stage) }))}
            />
          )}
        </form.Field>

        <form.Field
          name="estimated_value_usd"
          validators={{ onChange: leadFormZodSchema.shape.estimated_value_usd }}
        >
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

      <form.Field name="owner_id">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Owner"
            value={field.state.value ?? ""}
            onChange={field.handleChange}
            disabled={isPending}
            placeholder={lead ? "Nobody yet" : "Whoever adds it"}
            description="Whose deal this is. It travels onto the client when the deal is won."
            options={people.map((person) => ({ value: person.id, label: person.full_name }))}
          />
        )}
      </form.Field>

      <form.Field name="notes" validators={{ onChange: leadFormZodSchema.shape.notes }}>
        {(field) => <AppTextarea field={field} label="Notes" disabled={isPending} />}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
          {lead ? "Save changes" : "Add lead"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

type CreateLeadModalProps = {
  /** Absent to add a lead; present to edit that one. */
  lead?: ILead | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// One dialog for adding and editing a lead: the same fields with the same rules.
const CreateLeadModal = ({ lead, open, onOpenChange }: CreateLeadModalProps) => {
  // Uncontrolled as the "Add lead" trigger, controlled when a card opens it for an edit.
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next)
      else setInternalOpen(next)
    },
    [isControlled, onOpenChange],
  )

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button" className="shrink-0">
            <Plus className="size-4" />
            Add lead
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{lead ? `Edit ${lead.name}` : "Add lead"}</DialogTitle>
          <DialogDescription>
            {lead
              ? "A stage changed here goes on the lead's history like a move on the board."
              : "A deal that has not been won yet."}
          </DialogDescription>
        </DialogHeader>

        {/* Mounted per open and keyed on the lead, so it always starts from that lead's values. */}
        {isOpen && <LeadForm key={lead?.id ?? "create"} lead={lead} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

export default CreateLeadModal
