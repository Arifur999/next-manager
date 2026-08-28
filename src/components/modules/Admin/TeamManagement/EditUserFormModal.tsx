"use client"

import { updateUserAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { type IUser } from "@/types/user.types"
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  editUserFormZodSchema,
  type IEditUserFormValues,
} from "@/zod/user.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type EditUserFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: IUser | null
}

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))

const isAssignableRole = (role: string): role is IEditUserFormValues["role"] =>
  (ASSIGNABLE_ROLES as readonly string[]).includes(role)

const EditUserForm = ({ user, onOpenChange }: { user: IUser; onOpenChange: (open: boolean) => void }) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IEditUserFormValues) => updateUserAction(user.id, values),
  })

  const form = useForm({
    defaultValues: {
      full_name: user.full_name,
      phone: user.phone ?? "",
      // A super_admin row would carry a role this form cannot assign; fall back
      // rather than rendering a Select with a value that is not an option.
      role: isAssignableRole(user.role) ? user.role : "operations",
      is_active: user.is_active,
    } satisfies IEditUserFormValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to update team member")
        return
      }

      toast.success(result.message || "Team member updated successfully")
      onOpenChange(false)

      void queryClient.invalidateQueries({ queryKey: ["users"] })
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
      <form.Field name="full_name" validators={{ onChange: editUserFormZodSchema.shape.full_name }}>
        {(field) => <AppField field={field} label="Full name" disabled={isPending} />}
      </form.Field>

      <form.Field name="phone">
        {(field) => <AppField field={field} label="Phone" placeholder="Optional" disabled={isPending} />}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Role</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as IEditUserFormValues["role"])}
              disabled={isPending}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="is_active">
        {(field) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor={field.name} className="font-normal">
              Active — can sign in
            </Label>
          </div>
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
          Save changes
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

const EditUserFormModal = ({ open, onOpenChange, user }: EditUserFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,32rem)] lg:max-w-[min(88vw,32rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit team member</DialogTitle>
          <DialogDescription>
            Email and password are changed from their own flows, not here.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            {/* Keyed on the row id, so opening a different member remounts the
                form with their values instead of keeping the previous ones. */}
            {user ? <EditUserForm key={user.id} user={user} onOpenChange={onOpenChange} /> : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserFormModal
