"use client"

import { acceptInviteAction } from "@/app/(commonLayout)/(auth)/join/[token]/_action"
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
import type { IInvitePreview } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Clock, Eye, EyeOff, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

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

const joinSchema = z.object({
  full_name: z.string().min(1, "Your name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
})

type JoinValues = z.infer<typeof joinSchema>

const JoinForm = ({ token, invite }: { token: string; invite: IInvitePreview | null }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: JoinValues) => acceptInviteAction(token, values),
  })

  const form = useForm({
    defaultValues: { full_name: "", password: "" } as JoinValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Could not complete your request")
        return
      }

      setSubmitted(true)
    },
  })

  // A dead link is its own screen rather than a form that fails on submit.
  // Expired, already used, revoked and never-real all land here, because the
  // server does not tell them apart and neither should this.
  if (!invite) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <LinkIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-2xl">This invite is no longer valid</CardTitle>
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
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <Clock className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-2xl">Waiting on {invite.organization_name}</CardTitle>
            <CardDescription>
              Your account is set up. An admin has to approve it before you can sign in —
              you will not be able to get in until they do.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Once approved, sign in at{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join {invite.organization_name}</CardTitle>
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

            <form.Field name="full_name" validators={{ onChange: joinSchema.shape.full_name }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Your name"
                  placeholder="Habib Rahman"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="password" validators={{ onChange: joinSchema.shape.password }}>
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
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
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
