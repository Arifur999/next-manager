"use client"

import { resetPasswordAction } from "@/app/(commonLayout)/(auth)/reset-password/_action"
import AppField from "@/components/shared/form/AppField"
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
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

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
  const [showPassword, setShowPassword] = useState(false)
  const [confirm, setConfirm] = useState("")

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IResetPasswordFormValues) => resetPasswordAction(values),
  })

  const form = useForm({
    defaultValues: { token, new_password: "" } as IResetPasswordFormValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        // "That reset link is no longer valid. Ask for a new one." — one
        // message for expired, spent and unknown, and it comes from the server.
        toast.error(result.message || "Could not reset your password")
        return
      }

      toast.success("Password reset. Sign in with the new one.")
      router.replace("/login")
    },
  })

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <LinkIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-2xl">This link is incomplete</CardTitle>
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>
            This signs you out everywhere, including any session left open on another
            device.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
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
                <div className="relative">
                  <AppField
                    field={field}
                    label="New password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters, with a letter and a number"
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-7"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
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
