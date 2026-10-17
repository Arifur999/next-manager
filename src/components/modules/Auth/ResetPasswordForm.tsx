"use client"

import { resetPasswordAction } from "@/app/(commonLayout)/(auth)/reset-password/_action"
import FormErrorAlert from "@/components/modules/Auth/FormErrorAlert"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordFormZodSchema, type IResetPasswordFormValues } from "@/zod/auth.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { useRef, useState } from "react"

/**
 * Setting a new password from an emailed link.
 *
 * The page checks the token before this renders, so a dead or incomplete link
 * never gets this far. The token is never shown or editable: it is a
 * credential, and a field holding one invites it into a screenshot.
 */

const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter()
  const [confirm, setConfirm] = useState("")
  const [refusal, setRefusal] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // The link can still die between the check and the submit (used in another
  // tab, or past its 30 minutes); the server's message then shows here.
  const { run: resetPassword, isPending } = useActionMutation({
    action: resetPasswordAction,
    successMessage: "Password reset. Sign in with the new one.",
    refresh: false,
    onError: setRefusal,
  })

  const form = useForm({
    defaultValues: { token, new_password: "" } satisfies IResetPasswordFormValues,
    validationLogic: revalidateLogic(),
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      setRefusal(null)
      if (await resetPassword(value)) router.replace("/login")
    },
  })

  const mismatch = confirm.length > 0 && form.state.values.new_password !== confirm

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          </CardTitle>
          <CardDescription>
            This signs you out everywhere, including any session left open on another
            device.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            ref={formRef}
            method="POST"
            action="#"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (mismatch || confirm.length === 0) return
              form.handleSubmit()
            }}
            className="space-y-5"
          >
            <form.Field
              name="new_password"
              validators={{ onDynamic: resetPasswordFormZodSchema.shape.new_password }}
            >
              {(field) => (
                <PasswordField field={field} label="New password" disabled={isPending} />
              )}
            </form.Field>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                disabled={isPending}
                aria-invalid={mismatch}
                required
              />
              {mismatch && <p className="text-xs text-destructive">These do not match.</p>}
            </div>

            <FormErrorAlert message={refusal} />

            <AppSubmitButton isPending={isPending} pendingLabel="Resetting...">
              Set new password
            </AppSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPasswordForm
