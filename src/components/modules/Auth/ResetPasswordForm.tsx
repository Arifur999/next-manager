"use client"

import { resetPasswordAction } from "@/app/(commonLayout)/(auth)/reset-password/_action"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
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
import { useForm } from "@tanstack/react-form"
import { LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { useRef, useState } from "react"

/**
 * Setting a new password from an emailed link.
 *
 * The token comes from ?token= and is never shown or editable — it is a
 * credential, and a field holding one invites it into a screenshot.
 *
 * Arriving with no token at all is its own state rather than a form that will
 * certainly fail on submit. That happens whenever somebody's mail client
 * mangles the link, and telling them so is more use than letting them type a
 * password twice first.
 */

const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [confirm, setConfirm] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  // A dead link gets one message for expired, spent and unknown, from the server.
  const { run: resetPassword, isPending } = useActionMutation({
    action: resetPasswordAction,
    successMessage: "Password reset. Sign in with the new one.",
    refresh: false,
  })

  const form = useForm({
    defaultValues: { token, new_password: "" } satisfies IResetPasswordFormValues,
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      if (await resetPassword(value)) router.replace("/login")
    },
  })

  if (!token) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader className="items-center text-center">
            <LinkIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle>
              <h1 className="text-2xl font-semibold tracking-tight">This link is incomplete</h1>
            </CardTitle>
            <CardDescription>
              It is missing the part that identifies your request — usually a mail client
              breaking the link across two lines. Ask for a fresh one.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/forgot-password">Send a new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              validators={{ onChange: resetPasswordFormZodSchema.shape.new_password }}
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
