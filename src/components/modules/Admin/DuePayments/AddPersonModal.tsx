"use client"

import { createDuePersonAction } from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
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
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Informal lending, in and out.
 *
 * The sign convention is the thing to get right on screen: a POSITIVE balance
 * means the agency has taken more from that person than it has given back, so
 * the agency owes THEM. Showing a bare signed number would leave every reader
 * working that out from scratch, so each row says which way it points.
 */

const AddPersonModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: { name: string; phone?: string }) => createDuePersonAction(values),
  })

  const form = useForm({
    defaultValues: { name: "", phone: "" },
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to add person")
        return
      }

      toast.success("Person added")
      setOpen(false)
      form.reset()
      void queryClient.invalidateQueries({ queryKey: ["due-people"] })
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="shrink-0">
          <UserPlus className="size-4" />
          Add person
        </Button>
      </DialogTrigger>

      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add person</DialogTitle>
          <DialogDescription>
            Someone the agency lends to or borrows from. Kept apart from clients and team members,
            because this balance is personal.
          </DialogDescription>
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
          <form.Field name="name" validators={{ onChange: z.string().min(1, "Name is required") }}>
            {(field) => <AppField field={field} label="Name" disabled={isPending} />}
          </form.Field>

          <form.Field name="phone">
            {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
          </form.Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
              Add person
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPersonModal
