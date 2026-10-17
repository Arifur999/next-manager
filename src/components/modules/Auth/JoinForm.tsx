"use client"

import { acceptInviteAction } from "@/app/(commonLayout)/(auth)/join/[token]/_action"
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
import type { IInvitePreview } from "@/types/people.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { joinFormZodSchema, type IJoinFormValues } from "@/zod/auth.validation"

/**
 * Joining a company from an invite link.
 *
 * Name and password only. **The email is not a field** — it comes from the
 * invite and is shown read-only, because a form that let you type one would
 * let whoever holds a leaked link create an account under any address they
 * liked, which is exactly what binding the invite to an address prevents.
 *
 * Submitting does not sign you in, and the screen says so plainly rather than
 * dropping you at a login form that will refuse you. An admin has to approve
 * first; that is the point of the flow, not a delay to apologise for.
 */

const JoinForm = ({ token, invite }: { token: string; invite: IInvitePreview }) => {
  const [submitted, setSubmitted] = useState(false)

  // The waiting screen that follows is the confirmation.
  const { run: requestToJoin, isPending } = useActionMutation({
    action: (values: IJoinFormValues) => acceptInviteAction(token, values),
    successMessage: false,
    refresh: false,
  })

  const form = useForm({
    defaultValues: { full_name: "", password: "" } satisfies IJoinFormValues,
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (await requestToJoin(value)) setSubmitted(true)
    },
  })

  if (submitted) {
    return (
      <AuthNoticeCard
        icon={Clock}
        title={`Waiting on ${invite.organization_name}`}
        description="Your account is set up. An admin has to approve it before you can sign in — you will not be able to get in until they do."
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
            <h1 className="text-2xl font-semibold tracking-tight">Join {invite.organization_name}</h1>
          </CardTitle>
          <CardDescription>
            Choose a name and a password. An admin approves your account before you can
            sign in.
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
            {/* Stated so nobody hunts for a way to change it. */}
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
              Request to join
            </AppSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default JoinForm
