"use client"

import { createUserAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_action"
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
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  createUserFormZodSchema,
  type ICreateUserFormValues,
} from "@/zod/user.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

const defaultValues: ICreateUserFormValues = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "operations",
}

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))

const CreateUserFormModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: ICreateUserFormValues) => createUserAction(values),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      // The action never throws, so success is a value to branch on.
      if (!result.success) {
        toast.error(result.message || "Failed to create team member")
        return
      }

      toast.success(result.message || "Team member created successfully")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["users"] })
      router.refresh()
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

              {/* Not an AppField: that one wraps Input. A non-Input control gets
                  the same space-y-1.5 + Label block written out here. */}
              <form.Field name="role">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Role</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as ICreateUserFormValues["role"])
                      }
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
