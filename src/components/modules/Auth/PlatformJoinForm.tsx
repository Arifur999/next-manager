"use client"

import { acceptPlatformInviteAction } from "@/app/(commonLayout)/(auth)/platform-join/[token]/_action"
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
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { Clock, Eye, EyeOff, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { joinFormZodSchema, type IJoinFormValues } from "@/zod/auth.validation"

/**
 * Joining the platform team from an invite link.
 *
 * The same shape as the company join form and deliberately not looser. The
 * email is shown read-only and is not a field: a platform account created
 * under somebody else's address could suspend every customer, which is why the
 * invite is bound to one.
 */

const PlatformJoinForm = ({
  token,
  invite,
}: {
  token: string
  invite: { email: string } | null
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // The waiting screen that follows is the confirmation.
  const { run: requestAccess, isPending } = useActionMutation({
    action: (values: IJoinFormValues) => acceptPlatformInviteAction(token, values),
    successMessage: false,
    refresh: false,
  })

  const form = useForm({
    defaultValues: { full_name: "", password: "" } satisfies IJoinFormValues,
    onSubmit: async ({ value }) => {
      if (await requestAccess(value)) setSubmitted(true)
    },
  })

  if (!invite) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader className="items-center text-center">
            <LinkIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle>
              <h1 className="text-2xl font-semibold tracking-tight">This invite is no longer valid</h1>
            </CardTitle>
            <CardDescription>
              It may have expired, been used already, or been withdrawn. Ask whoever
              invited you for a fresh link.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader className="items-center text-center">
            <Clock className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle>
              <h1 className="text-2xl font-semibold tracking-tight">Waiting for approval</h1>
            </CardTitle>
            <CardDescription>
              Your account is set up. An existing operator has to approve it before you can
              sign in — a platform account can reach every customer, so it is not granted
              by a link alone.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Once approved, sign in at{" "}
              <Link href="/login" className="text-primary-strong underline underline-offset-4 hover:decoration-2">
                the login page
              </Link>{" "}
              with the password you just chose.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">Join the platform team</h1>
          </CardTitle>
          <CardDescription>
            Choose a name and a password. An existing operator approves your account before
            you can sign in.
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
              form.handleSubmit()
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="platform-join-email">Email</Label>
              <Input id="platform-join-email" value={invite.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                This is the address the invite was sent to and cannot be changed.
              </p>
            </div>

            <form.Field name="full_name" validators={{ onChange: joinFormZodSchema.shape.full_name }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Your name"
                  placeholder="Alex Morgan"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="password" validators={{ onChange: joinFormZodSchema.shape.password }}>
              {(field) => (
                <div className="relative">
                  <AppField
                    field={field}
                    label="Choose a password"
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
                    {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                  </Button>
                </div>
              )}
            </form.Field>

            <AppSubmitButton isPending={isPending} pendingLabel="Sending...">
              Request access
            </AppSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlatformJoinForm
