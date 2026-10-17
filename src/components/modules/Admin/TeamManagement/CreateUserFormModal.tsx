"use client"

import { createUserAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_action"
import DepartmentField from "@/components/modules/Admin/TeamManagement/DepartmentField"
import RoleField from "@/components/modules/Admin/TeamManagement/RoleField"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  NO_DEPARTMENT,
  createUserFormZodSchema,
  type ICreateUserFormValues,
} from "@/zod/user.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { queryKeys } from "@/lib/queryKeys"

const defaultValues: ICreateUserFormValues = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "operations",
  department_id: NO_DEPARTMENT,
}

const CreateUserFormModal = () => {
  const [open, setOpen] = useState(false)

  // No successMessage: the toast is the server's "User created successfully".
  const { run: addMember, isPending } = useActionMutation({
    action: createUserAction,
    invalidateKeys: [queryKeys.users.all],
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (await addMember(value)) {
        setOpen(false)
        form.reset()
      }
    },
  })

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Add member
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,32rem)] lg:max-w-[min(88vw,32rem)]"
        // A half-filled form must not vanish on a stray click outside it.
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            They will be able to sign in immediately with the password you set here.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            <form
              method="POST"
              action="#"
              noValidate
              onSubmit={(event) => {
                // TanStack Form owns submission; the browser must not.
                event.preventDefault()
                event.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-5"
            >
              <form.Field
                name="full_name"
                validators={{ onChange: createUserFormZodSchema.shape.full_name }}
              >
                {(field) => (
                  <AppField field={field} label="Full name" placeholder="e.g. Rahim Uddin" disabled={isPending} />
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{ onChange: createUserFormZodSchema.shape.email }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <AppField field={field} label="Phone" placeholder="Optional" disabled={isPending} />
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{ onChange: createUserFormZodSchema.shape.password }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="Temporary password"
                    type="password"
                    placeholder="At least 8 characters"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <form.Field name="role">
                {(field) => (
                  <RoleField value={field.state.value} onChange={field.handleChange} disabled={isPending} />
                )}
              </form.Field>

              <form.Field name="department_id">
                {(field) => (
                  <DepartmentField
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
                  Add member
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserFormModal
