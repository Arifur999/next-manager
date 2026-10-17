"use client"

import { changePasswordAction } from "@/app/(dashboardLayout)/change-password/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { changePasswordFormZodSchema, type IChangePasswordFormValues } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

/**
 * Changing your own password.
 *
 * The server bumps token_version on success, which retires every token issued
 * before that moment — including sessions open on other devices. That is the
 * point of changing a password, but it also means THIS session's token is dead
 * the instant the request succeeds, so the only correct next step is to send
 * the person to sign in again. Staying on the page would leave them clicking
 * around a UI whose every request is about to 401.
 */

const RULES = "At least 8 characters, with a letter and a number."

// The confirmation is the form's own check, so it is not part of the schema.
type ChangePasswordValues = IChangePasswordFormValues & { confirm_password: string }

const defaultValues: ChangePasswordValues = { old_password: "", new_password: "", confirm_password: "" }

const ChangePasswordForm = () => {
  const router = useRouter()

  // A refusal ("Current password is incorrect") is the server's own words.
  const { run: changePassword, isPending } = useActionMutation({
    action: changePasswordAction,
    successMessage: "Password changed. Sign in again with the new one.",
    refresh: false,
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const changed = await changePassword({
        old_password: value.old_password,
        new_password: value.new_password,
      })
      if (!changed) return

      router.replace("/login")
      // The action cleared the cookies, but the client Router Cache still holds the
      // signed-in layout; without this, Back renders a shell for a dead session.
      router.refresh()
    },
  })

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Change password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Changing it signs you out everywhere, including any session left open on
          another device.
        </p>
      </CardHeader>

      <form
        className="max-w-md space-y-5 p-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="old_password">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="old-password">Current password</Label>
              <Input
                id="old-password"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                disabled={isPending}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="new_password"
          validators={{ onChange: changePasswordFormZodSchema.shape.new_password }}
        >
          {(field) => {
            // The rules line itself turns red, rather than a second message repeating it.
            const breaksRules = field.state.meta.isTouched && field.state.meta.errors.length > 0

            return (
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isPending}
                  required
                  aria-invalid={breaksRules}
                  aria-describedby="new-password-rules"
                />
                <p
                  id="new-password-rules"
                  className={`text-xs ${breaksRules ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {RULES}
                </p>
              </div>
            )
          }}
        </form.Field>

        {/* Checked here as well as on the server: making somebody submit a form to be
            told they mistyped the confirmation is a round-trip for nothing. */}
        <form.Subscribe selector={({ values }) => values.new_password}>
          {(newPassword) => (
            <form.Field name="confirm_password">
              {(field) => {
                const mismatch = field.state.value.length > 0 && field.state.value !== newPassword

                return (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                      required
                      aria-invalid={mismatch}
                    />
                    {mismatch && <p className="text-xs text-destructive">These do not match.</p>}
                  </div>
                )
              }}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Subscribe
          selector={({ values }) =>
            values.old_password.length > 0 &&
            changePasswordFormZodSchema.shape.new_password.safeParse(values.new_password).success &&
            values.new_password === values.confirm_password
          }
        >
          {(isReady) => (
            <Button type="submit" disabled={isPending || !isReady}>
              {isPending ? "Changing..." : "Change password"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}

export default ChangePasswordForm
