"use client"

import { acceptAgencyInviteAction } from "@/app/(commonLayout)/(auth)/agency-join/[token]/_action"
import type { AgencyInvite } from "@/app/(commonLayout)/(auth)/agency-join/[token]/page"
import AppField from "@/components/shared/form/AppField"
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
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { CircleCheck, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { agencyJoinFormZodSchema, type IAgencyJoinFormValues } from "@/zod/auth.validation"

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

const AgencyJoinForm = ({
  token,
  invite,
}: {
  token: string
  invite: AgencyInvite | null
}) => {
  const [opened, setOpened] = useState<string | null>(null)

  // Fixed when the deal was agreed with a named agency: that is the name on the
  // record, and it should not change on the way in.
  const nameIsFixed = Boolean(invite?.company_name)

  // The "is open" screen that follows is the confirmation.
  const { run: openAgency, isPending } = useActionMutation({
    action: (values: IAgencyJoinFormValues) => acceptAgencyInviteAction(token, values),
    successMessage: false,
    refresh: false,
  })

  const form = useForm({
    defaultValues: {
      full_name: "",
      company_name: invite?.company_name ?? "",
      password: "",
    } satisfies IAgencyJoinFormValues,
    onSubmit: async ({ value }) => {
      if (await openAgency(value)) setOpened(value.company_name)
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

  if (opened) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader className="items-center text-center">
            <CircleCheck className="size-8 text-muted-foreground" aria-hidden="true" />
            <CardTitle>
              <h1 className="text-2xl font-semibold tracking-tight">{opened} is open</h1>
            </CardTitle>
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
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">{nameIsFixed ? `Open ${invite.company_name}` : "Open your agency"}</h1>
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
                validators={{ onChange: agencyJoinFormZodSchema.shape.company_name }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="Your agency's name"
                    placeholder="Northwind Studio"
                    disabled={isPending}
                  />
                )}
              </form.Field>
            )}

            <form.Field name="full_name" validators={{ onChange: agencyJoinFormZodSchema.shape.full_name }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Your name"
                  placeholder="Alex Morgan"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="password" validators={{ onChange: agencyJoinFormZodSchema.shape.password }}>
              {(field) => (
                <PasswordField field={field} label="Choose a password" disabled={isPending} />
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
