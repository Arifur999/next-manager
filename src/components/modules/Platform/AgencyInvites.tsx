"use client"

import { inviteAgencyAction } from "@/app/(dashboardLayout)/platform/_agencyAction"
import AgencyInviteList from "@/components/modules/Platform/AgencyInviteList"
import { planOptionLabel } from "@/components/modules/Platform/planLabel"
import InviteLinkPanel from "@/components/shared/InviteLinkPanel"
import AppField from "@/components/shared/form/AppField"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { agencyInviteFormZodSchema, type IAgencyInviteFormValues } from "@/zod/platform.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { plansQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"
import type { IInviteMail } from "@/types/common.types"

/**
 * Bringing an agency on: the owner gets a link, sets their own password and
 * lands owning their workspace. Their own team is added from inside it.
 * Nothing is created until the link is opened.
 */

// A Select cannot hold "", which is what the form keeps for "the sign-up default".
const NO_PLAN = "__none__"

const inviteDefaults: IAgencyInviteFormValues = { email: "", company_name: "", plan_id: "", trial_days: "14" }

const AgencyInvites = () => {
  const [freshLink, setFreshLink] = useState<string | null>(null)
  const [mailed, setMailed] = useState<IInviteMail | null>(null)

  const { data: planData } = useQuery(plansQuery())

  const plans = ((planData?.data ?? [])).filter((plan) => plan.is_active)

  const { run: sendInvite, isPending } = useActionMutation({
    action: inviteAgencyAction,
    // The server phrases its message against what happened to the email.
    successMessage: false,
    invalidateKeys: [queryKeys.agencyInvites.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return

      const mail = result.data.email
      setFreshLink(result.data.join_url)
      setMailed(mail)

      if (mail.delivered) toast.success(result.message)
      else toast.warning(result.message, { description: mail.reason ?? undefined })
    },
  })

  const form = useForm({
    defaultValues: inviteDefaults,
    onSubmit: async ({ value, formApi }) => {
      if (!(await sendInvite(value))) return

      // The plan and trial stay as chosen, for the next agency invited on the same deal.
      formApi.reset(
        { ...inviteDefaults, plan_id: value.plan_id, trial_days: value.trial_days },
        { keepDefaultValues: true },
      )
    },
  })

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <form
          className="space-y-5 p-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="email" validators={{ onChange: agencyInviteFormZodSchema.shape.email }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Owner's email"
                  type="email"
                  autoComplete="off"
                  placeholder="e.g. owner@theiragency.com"
                  description="The link works once, and only for this address."
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field
              name="company_name"
              validators={{ onChange: agencyInviteFormZodSchema.shape.company_name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Agency name (optional)"
                  autoComplete="off"
                  placeholder="e.g. Bright Pixel Agency"
                  description={
                    field.state.value.trim()
                      ? "They cannot change it on the way in."
                      : "Leave it empty and they name the agency when they open the link."
                  }
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="plan_id">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="agency-plan">Plan</Label>
                  <Select
                    value={field.state.value || NO_PLAN}
                    onValueChange={(value) => field.handleChange(value === NO_PLAN ? "" : value)}
                  >
                    <SelectTrigger id="agency-plan" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PLAN}>Whatever new sign-ups get</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {planOptionLabel(plan)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {plans.some((plan) => plan.id === field.state.value) ? (
                      "They see the plan before they choose a password."
                    ) : (
                      <>
                        Uses the sign-up plan from{" "}
                        <Link
                          href="/platform/settings"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          settings
                        </Link>
                        , or no plan if none is set.
                      </>
                    )}
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="trial_days" validators={{ onChange: agencyInviteFormZodSchema.shape.trial_days }}>
              {(field) => (
                <AppField
                  field={field}
                  label="Trial length (days)"
                  type="number"
                  min={0}
                  max={365}
                  className="max-w-40"
                  description={
                    Number(field.state.value) === 0
                      ? "No trial. They start paying the day they open it."
                      : `Free for ${field.state.value} days, then the plan is charged.`
                  }
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>

          <Button type="submit" disabled={isPending}>
            <Send className="size-4" aria-hidden="true" />
            {isPending ? "Sending..." : "Send invite"}
          </Button>
        </form>

        {freshLink && (
          <InviteLinkPanel
            key={freshLink}
            link={freshLink}
            mail={mailed}
            onDone={() => {
              setFreshLink(null)
              setMailed(null)
            }}
          />
        )}
      </Card>

      <AgencyInviteList />
    </div>
  )
}

export default AgencyInvites
