"use client"

import { acceptAgencyInviteAction } from "@/app/(commonLayout)/(auth)/agency-join/[token]/_action"
import type { AgencyInvite } from "@/app/(commonLayout)/(auth)/agency-join/[token]/page"
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
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { CircleCheck, Eye, EyeOff, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Opening your own agency from an invite.
 *
 * Different from the platform-team form in what it produces: this one creates a
 * workspace the person owns, so it says what they are being put on before they
 * choose a password. Somebody about to open an account is entitled to know
 * whether it costs money on Tuesday.
 *
 * The email is read-only and not a field, for the same reason as everywhere
 * else: the invite is bound to one address server-side.
 */

const schema = z.object({
  full_name: z.string().min(1, "Your name is required"),
  company_name: z.string().min(1, "Your agency needs a name"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
})

type JoinValues = z.infer<typeof schema>

const AgencyJoinForm = ({
  token,
  invite,
}: {
  token: string
  invite: AgencyInvite | null
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [opened, setOpened] = useState<string | null>(null)

  // Fixed when the deal was agreed with a named agency: that is the name on the
  // record, and it should not change on the way in.
  const nameIsFixed = Boolean(invite?.company_name)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: JoinValues) =>
      acceptAgencyInviteAction(token, {
        full_name: values.full_name,
        password: values.password,
        company_name: values.company_name,
      }),
  })

  const form = useForm({
    defaultValues: {
      full_name: "",
      company_name: invite?.company_name ?? "",
      password: "",
    } as JoinValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Could not open your agency")
        return
      }

      setOpened(value.company_name)
    },
  })

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

  if (opened) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader className="items-center text-center">
            <CircleCheck className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-2xl">{opened} is open</CardTitle>
            <CardDescription>
              You own it. Sign in and add your team — sales people, project managers and
              your operations crew all get their own accounts, and you decide who sees
              what.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {nameIsFixed ? `Open ${invite.company_name}` : "Open your agency"}
          </CardTitle>
          <CardDescription>
            {/* Said before the password, not after: somebody about to open an
                account is entitled to know what it costs. */}
            {invite.plan
              ? invite.trial_days > 0
                ? `${invite.trial_days} days on ${invite.plan.name} to try everything, then $${invite.plan.price_usd} a month.`
                : `On ${invite.plan.name}, $${invite.plan.price_usd} a month from the day you open it.`
              : "Your workspace will be set up for you before there is anything to pay."}
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
              <Label htmlFor="agency-join-email">Email</Label>
              <Input id="agency-join-email" value={invite.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                This is the address the invite was sent to and cannot be changed.
              </p>
            </div>

            {nameIsFixed ? (
              <div className="space-y-1.5">
                <Label htmlFor="agency-join-company">Agency</Label>
                <Input id="agency-join-company" value={invite.company_name} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Agreed when you were invited. You can rename it from your settings once
                  you are in.
                </p>
              </div>
            ) : (
              <form.Field
                name="company_name"
                validators={{ onChange: schema.shape.company_name }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="Your agency's name"
                    placeholder="Naxified Media"
                    disabled={isPending}
                  />
                )}
              </form.Field>
            )}

            <form.Field name="full_name" validators={{ onChange: schema.shape.full_name }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Your name"
                  placeholder="Habib Rahman"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="password" validators={{ onChange: schema.shape.password }}>
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

            <AppSubmitButton isPending={isPending} pendingLabel="Opening...">
              Open my agency
            </AppSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgencyJoinForm
