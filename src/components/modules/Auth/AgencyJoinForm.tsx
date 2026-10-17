"use client"

import { acceptAgencyInviteAction } from "@/app/(commonLayout)/(auth)/agency-join/[token]/_action"
import AuthNoticeCard from "@/components/modules/Auth/AuthNoticeCard"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import ReadOnlyField from "@/components/shared/form/ReadOnlyField"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatUsd } from "@/lib/currency"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { CircleCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  agencyJoinFormZodSchema,
  type IAgencyInvitePreview,
  type IAgencyJoinFormValues,
} from "@/zod/auth.validation"

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

// Said before the password, not after: somebody about to open an account is
// entitled to know what it costs.
const planTerms = ({ plan, trial_days }: IAgencyInvitePreview) => {
  if (!plan) return "Your workspace will be set up for you before there is anything to pay."
  const price = formatUsd(plan.price_usd, { compact: Number.isInteger(plan.price_usd) })
  if (trial_days > 0) return `${trial_days} days on ${plan.name} to try everything, then ${price} a month.`
  return `On ${plan.name}, ${price} a month from the day you open it.`
}

const AgencyJoinForm = ({
  token,
  invite,
}: {
  token: string
  invite: IAgencyInvitePreview
}) => {
  const [opened, setOpened] = useState<string | null>(null)

  // Fixed when the deal was agreed with a named agency: that is the name on the
  // record, and it should not change on the way in.
  const nameIsFixed = Boolean(invite.company_name)

  // The "is open" screen that follows is the confirmation.
  const { run: openAgency, isPending } = useActionMutation({
    action: (values: IAgencyJoinFormValues) => acceptAgencyInviteAction(token, values),
    successMessage: false,
    refresh: false,
  })

  const form = useForm({
    defaultValues: {
      full_name: "",
      company_name: invite.company_name,
      password: "",
    } satisfies IAgencyJoinFormValues,
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (await openAgency(value)) setOpened(value.company_name)
    },
  })

  if (opened) {
    return (
      <AuthNoticeCard
        icon={CircleCheck}
        title={`${opened} is open`}
        description="You own it. Sign in and add your team — sales people, project managers and your operations crew all get their own accounts, and you decide who sees what."
      >
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </AuthNoticeCard>
    )
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">{nameIsFixed ? `Open ${invite.company_name}` : "Open your agency"}</h1>
          </CardTitle>
          <CardDescription>{planTerms(invite)}</CardDescription>
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

            {nameIsFixed ? (
              <ReadOnlyField
                label="Agency"
                value={invite.company_name}
                reason="Agreed when you were invited. You can rename it from your settings once you are in."
              />
            ) : (
              <form.Field
                name="company_name"
                validators={{ onDynamic: agencyJoinFormZodSchema.shape.company_name }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="Your agency's name"
                    autoComplete="organization"
                    placeholder="e.g. Northwind Studio"
                    disabled={isPending}
                  />
                )}
              </form.Field>
            )}

            <form.Field name="full_name" validators={{ onDynamic: agencyJoinFormZodSchema.shape.full_name }}>
              {(field) => <AppField field={field} label="Your name" autoComplete="name" disabled={isPending} />}
            </form.Field>

            <form.Field name="password" validators={{ onDynamic: agencyJoinFormZodSchema.shape.password }}>
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
