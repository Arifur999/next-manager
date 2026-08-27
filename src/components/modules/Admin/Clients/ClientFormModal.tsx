"use client"

import {
  createClientAction,
  updateClientAction,
} from "@/app/(dashboardLayout)/admin/dashboard/clients/_action"
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { IClient } from "@/types/agencio.types"
import { clientFormZodSchema, type IClientFormValues } from "@/zod/agencio.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

/**
 * One modal for create and edit.
 *
 * The two forms are the same fields with the same rules, so keeping them apart
 * would mean every future field has to be added twice — and the day somebody
 * adds it once is the day the two quietly disagree.
 */
type ClientFormModalProps = {
  /** Absent for create; present for edit. */
  client?: IClient | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const emptyValues: IClientFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  status: "active",
  notes: "",
}

const ClientForm = ({ client, onDone }: { client?: IClient | null; onDone: () => void }) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const isEdit = Boolean(client)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IClientFormValues) =>
      client ? updateClientAction(client.id, values) : createClientAction(values),
  })

  const form = useForm({
    defaultValues: client
      ? {
          name: client.name,
          company: client.company ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          country: client.country ?? "",
          status: client.status,
          notes: client.notes ?? "",
        }
      : emptyValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || `Failed to ${isEdit ? "update" : "create"} client`)
        return
      }

      toast.success(result.message || `Client ${isEdit ? "updated" : "created"} successfully`)
      onDone()

      void queryClient.invalidateQueries({ queryKey: ["clients"] })
      router.refresh()
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
      <form.Field name="name" validators={{ onChange: clientFormZodSchema.shape.name }}>
        {(field) => (
          <AppField field={field} label="Name" placeholder="e.g. Acme Corp" disabled={isPending} />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="company">
          {(field) => <AppField field={field} label="Company" disabled={isPending} />}
        </form.Field>

        <form.Field name="country">
          {(field) => <AppField field={field} label="Country" disabled={isPending} />}
        </form.Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="email" validators={{ onChange: clientFormZodSchema.shape.email }}>
          {(field) => (
            <AppField field={field} label="Email" type="email" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
        </form.Field>
      </div>

      <form.Field name="status">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Status</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as IClientFormValues["status"])}
              disabled={isPending}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Notes</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton
          isPending={isPending}
          pendingLabel={isEdit ? "Saving..." : "Creating..."}
          className="w-auto"
        >
          {isEdit ? "Save changes" : "Create client"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

const ClientFormModal = ({ client, open, onOpenChange }: ClientFormModalProps) => {
  // Uncontrolled when used as the "create" trigger, controlled when the table
  // drives it for an edit.
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
          <Button type="button" className="ml-auto shrink-0">
            <Plus className="size-4" />
            Add client
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Update the details on file for this client."
              : "Someone the agency bills. Projects and invoices hang off this."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            {/* Keyed on the row, so opening a different client remounts the
                form with their values instead of keeping the previous ones. */}
            <ClientForm key={client?.id ?? "create"} client={client} onDone={() => setOpen(false)} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ClientFormModal
