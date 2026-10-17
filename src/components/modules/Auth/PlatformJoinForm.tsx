"use client"

import { acceptPlatformInviteAction } from "@/app/(commonLayout)/(auth)/platform-join/[token]/_action"
import AuthNoticeCard from "@/components/modules/Auth/AuthNoticeCard"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import ReadOnlyField from "@/components/shared/form/ReadOnlyField"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { revalidateLogic, useForm } from "@tanstack/react-form"
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
  invite: { email: string }
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
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (await requestAccess(value)) setSubmitted(true)
    },
  })

  if (submitted) {
    return (
      <AuthNoticeCard
        icon={Clock}
        title="Waiting for approval"
        description="Your account is set up. An existing operator has to approve it before you can sign in — a platform account can reach every customer, so it is not granted by a link alone."
      >
        <p>
          Once approved, sign in at{" "}
          <Link href="/login" className="text-primary-strong underline underline-offset-4 hover:decoration-2">
            the login page
          </Link>{" "}
          with the password you just chose.
        </p>
      </AuthNoticeCard>
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
            <ReadOnlyField
              label="Email"
              value={invite.email}
              reason="This is the address the invite was sent to and cannot be changed."
            />

            <form.Field name="full_name" validators={{ onDynamic: joinFormZodSchema.shape.full_name }}>
              {(field) => <AppField field={field} label="Your name" autoComplete="name" disabled={isPending} />}
            </form.Field>

            <form.Field name="password" validators={{ onDynamic: joinFormZodSchema.shape.password }}>
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
