"use client"

import { updateMeAction } from "@/app/(dashboardLayout)/my-profile/_action"
import AppField from "@/components/shared/form/AppField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { profileFormZodSchema, type IProfileFormValues } from "@/zod/auth.validation"
import { ROLE_LABELS } from "@/zod/user.validation"
import type { IUser } from "@/types/user.types"
import { useForm } from "@tanstack/react-form"

/**
 * Your own record.
 *
 * Three editable fields, matching the server's allow-list exactly. Role and
 * email are shown but not editable, and are shown rather than hidden because
 * "which role am I" is the question this page gets opened to answer more often
 * than "I want to change my phone number".
 *
 * Email is read-only because it is the login identifier — changing it is
 * account recovery, not a profile edit, and a form that let you type over it
 * would be promising something the server will not do.
 */

const ProfileForm = ({ user }: { user: IUser }) => {
  // Keeps the default router refresh: the sidebar and navbar read the user
  // server-side, so the new name appears there only after the tree re-renders.
  const { run: saveProfile, isPending } = useActionMutation({
    action: updateMeAction,
    successMessage: "Profile updated",
  })

  const defaultValues: IProfileFormValues = { full_name: user.full_name, phone: user.phone ?? "" }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await saveProfile(value)
    },
  })

  // Against the saved record, which the refresh after a save brings up to date.
  const isChanged = (values: IProfileFormValues) =>
    values.full_name.trim() !== user.full_name || values.phone.trim() !== (user.phone ?? "")

  // ROLE_LABELS covers the roles an admin can assign. super_admin is not one
  // of them but does own an account, so it falls back to its own value rather
  // than being indexed for and coming back undefined.
  const roleLabel =
    user.role in ROLE_LABELS
      ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]
      : user.role.replace(/_/g, " ")

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Your details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your name is what colleagues see on approvals, timesheets and assignments.
        </p>
      </CardHeader>

      <form
        className="space-y-5 p-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <form.Field name="full_name" validators={{ onChange: profileFormZodSchema.shape.full_name }}>
            {(field) => (
              <AppField field={field} label="Full name" autoComplete="name" disabled={isPending} />
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <AppField
                field={field}
                label="Phone"
                type="tel"
                autoComplete="tel"
                placeholder="Optional"
                disabled={isPending}
              />
            )}
          </form.Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              This is how you sign in. An admin has to change it.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="flex h-9 items-center">
              <Badge variant="secondary">{roleLabel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              What you can reach. Only an admin can change it.
            </p>
          </div>
        </div>

        <form.Subscribe selector={({ values }) => isChanged(values) && values.full_name.trim() !== ""}>
          {(canSave) => (
            <Button type="submit" disabled={isPending || !canSave}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}

export default ProfileForm
