"use client"

import { acceptPlatformInviteAction } from "@/app/(commonLayout)/(auth)/platform-join/[token]/_action"
import AppField from "@/components/shared/form/AppField"
import InvalidInviteCard from "@/components/modules/Auth/InvalidInviteCard"
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
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { Clock } from "lucide-react"
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

  if (!invite) return <InvalidInviteCard />


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
                <PasswordField field={field} label="Choose a password" disabled={isPending} />
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
