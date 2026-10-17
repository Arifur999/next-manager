"use client"

import { updateMeAction } from "@/app/(dashboardLayout)/my-profile/_action"
import { EMAIL_REASON, getProfileCopy } from "@/components/modules/Account/profileCopy"
import AppField from "@/components/shared/form/AppField"
import ReadOnlyField from "@/components/shared/form/ReadOnlyField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { profileFormZodSchema, type IProfileFormValues } from "@/zod/auth.validation"
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

  const copy = getProfileCopy(user.role)

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Your details</CardTitle>
        <p className="text-sm text-muted-foreground">{copy.detailsIntro}</p>
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
              <AppField field={field} label="Phone (optional)" type="tel" autoComplete="tel" disabled={isPending} />
            )}
          </form.Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Email" value={user.email} reason={EMAIL_REASON} />
          <ReadOnlyField
            label="Role"
            value={<Badge variant="secondary">{copy.roleLabel}</Badge>}
            reason={copy.roleReason}
          />
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
