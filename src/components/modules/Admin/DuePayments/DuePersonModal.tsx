"use client"

import {
  createDuePersonAction,
  updateDuePersonAction,
} from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
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
import type { IDuePerson } from "@/types/spending.types"
import { duePersonFormZodSchema, type IDuePersonFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"
import { UserPlus } from "lucide-react"
import { useState } from "react"

const DuePersonForm = ({ person, onDone }: { person?: IDuePerson | null; onDone: () => void }) => {
  const { run: savePerson, isPending } = useActionMutation({
    action: (values: IDuePersonFormValues) =>
      person ? updateDuePersonAction(person.id, values) : createDuePersonAction(values),
    successMessage: person ? "Person updated" : "Person added",
    // The transactions list shows the name too.
    invalidateKeys: [queryKeys.duePeople.all, queryKeys.dueTransactions.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: { name: person?.name ?? "", phone: person?.phone ?? "" } satisfies IDuePersonFormValues,
    onSubmit: async ({ value }) => {
      if (await savePerson(value)) onDone()
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
      <form.Field name="name" validators={{ onChange: duePersonFormZodSchema.shape.name }}>
        {(field) => <AppField field={field} label="Name" autoComplete="off" disabled={isPending} />}
      </form.Field>

      <form.Field name="phone">
        {(field) => <AppField field={field} label="Phone" type="tel" autoComplete="off" disabled={isPending} />}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={person ? "Saving..." : "Adding..."} className="w-auto">
          {person ? "Save changes" : "Add person"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

type DuePersonModalProps = {
  /** Present to rename this person or change their phone; the list then drives `open`. */
  person?: IDuePerson | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Adding someone the agency lends to or borrows from, and correcting their details.
const DuePersonModal = ({ person, open, onOpenChange }: DuePersonModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next)
    else setInternalOpen(next)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="shrink-0">
            <UserPlus className="size-4" />
            Add person
          </Button>
        </DialogTrigger>
      )}

      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{person ? "Edit person" : "Add person"}</DialogTitle>
          <DialogDescription>
            Someone the agency lends to or borrows from. Kept apart from clients and team members,
            because this balance is personal.
          </DialogDescription>
        </DialogHeader>

        {/* Unmounts on close, so the next opening starts from fresh values. */}
        <DuePersonForm key={person?.id ?? "new"} person={person} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export default DuePersonModal
