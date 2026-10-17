"use client"

import { acceptInviteAction } from "@/app/(commonLayout)/(auth)/join/[token]/_action"
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
import type { IInvitePreview } from "@/types/people.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
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

const JoinForm = ({ token, invite }: { token: string; invite: IInvitePreview | null }) => {
  const [submitted, setSubmitted] = useState(false)

  // The waiting screen that follows is the confirmation.
  const { run: requestToJoin, isPending } = useActionMutation({
    action: (values: IJoinFormValues) => acceptInviteAction(token, values),
    successMessage: false,
    refresh: false,
  })

  const form = useForm({
    defaultValues: { full_name: "", password: "" } satisfies IJoinFormValues,
    onSubmit: async ({ value }) => {
      if (await requestToJoin(value)) setSubmitted(true)
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
              <h1 className="text-2xl font-semibold tracking-tight">Waiting on {invite.organization_name}</h1>
            </CardTitle>
            <CardDescription>
              Your account is set up. An admin has to approve it before you can sign in —
              you will not be able to get in until they do.
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
            <div className="space-y-1.5">
              <Label htmlFor="join-email">Email</Label>
              <Input id="join-email" value={invite.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                {/* Stated so nobody hunts for a way to change it. */}
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
              Request to join
            </AppSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default JoinForm
