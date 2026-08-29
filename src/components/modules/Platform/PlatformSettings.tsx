"use client"

import { updateSettingsAction } from "@/app/(dashboardLayout)/platform/_settingsAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPlatformSettings } from "@/services/agencio.services"
import type { IPlatformSettings } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { CircleAlert, CircleCheck, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

/**
 * How this installation is set up.
 *
 * Everything here is read by something, and the screen says by what. A settings
 * page whose values nothing consumes is the most convincing kind of broken: it
 * looks configured, it saves, and it changes nothing.
 *
 * SMTP is shown, not edited. Mail credentials live in the server's environment
 * where they can be rotated without a database write — so this reports whether
 * email works and which variable is missing when it does not, which is the
 * question somebody actually opens this page with.
 */

/** The sentinel for "leave new sign-ups unprovisioned" — Select cannot hold "". */
const NO_PLAN = "__none__"

const PlatformSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
  })

  const settings = data?.data as IPlatformSettings | undefined

  if (isLoading || !settings) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted/40" />
  }

  // Keyed on when the server last changed, so the form seeds itself from props
  // and remounts only when the saved values genuinely move. Copying the query
  // into state inside an effect would do the same job while also overwriting
  // whatever somebody had half-typed on any background refetch.
  return <SettingsForm key={settings.updated_at} settings={settings} />
}

const SettingsForm = ({ settings }: { settings: IPlatformSettings }) => {
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    product_name: settings.product_name,
    support_email: settings.support_email,
    default_plan_id: settings.default_plan_id ?? NO_PLAN,
    default_trial_days: settings.default_trial_days,
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updateSettingsAction({
        ...form,
        default_plan_id: form.default_plan_id === NO_PLAN ? null : form.default_plan_id,
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save the settings")
        return
      }
      toast.success("Settings saved")
      void queryClient.invalidateQueries({ queryKey: ["platform-settings"] })
    },
  })

  const smtp = settings.smtp
  const provisions = form.default_plan_id !== NO_PLAN

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ------------------------------------------------------------ brand */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What customers see</CardTitle>
          <p className="text-sm text-muted-foreground">
            Used in every email this server sends — password resets and campaigns.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              value={form.product_name}
              maxLength={60}
              onChange={(event) => setForm({ ...form, product_name: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Appears in subject lines, so keep it short. The app&apos;s own screens
              still read AGENCIO from the code — this is the name on outgoing mail.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support-email">Support address</Label>
            <Input
              id="support-email"
              type="email"
              value={form.support_email}
              placeholder="Leave empty to say nothing"
              onChange={(event) => setForm({ ...form, support_email: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {form.support_email
                ? "Added to the bottom of every email."
                : "Emails will not mention an address at all — better than one nobody reads."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- smtp */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" aria-hidden="true" />
            Email delivery
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set in the server&apos;s environment, not here — so credentials can be
            rotated without a database write, and never sit in a backup of this table.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Icon and words together, never colour alone. */}
            {smtp.configured ? (
              <>
                <CircleCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                <Badge variant="secondary">working</Badge>
              </>
            ) : (
              <>
                <CircleAlert className="size-4 text-muted-foreground" aria-hidden="true" />
                <Badge variant="destructive">not configured</Badge>
              </>
            )}
          </div>

          {smtp.configured ? (
            <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Server</dt>
              <dd className="truncate">
                {smtp.host}:{smtp.port}
              </dd>
              <dt className="text-muted-foreground">From</dt>
              <dd className="truncate">{smtp.from}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing is being emailed. Set{" "}
              <span className="font-mono text-xs">{smtp.missing.join(", ")}</span> in the
              server environment and restart it.
            </p>
          )}

          {/* Only once mail actually leaves: telling somebody their domain is
              unverified while nothing is being sent at all points them at the
              second problem and hides the first. */}
          {smtp.configured && (
          <p className="rounded bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
            Until the domain in the From address is verified with your mail provider,
            messages only reach your own address. Everything sent is logged, and{" "}
            <Link
              href="/platform/campaigns"
              className="text-primary underline-offset-4 hover:underline"
            >
              a campaign
            </Link>{" "}
            reports how many addresses it really got to.
          </p>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ signup */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New sign-ups</CardTitle>
          <p className="text-sm text-muted-foreground">
            What a company that signs itself up gets. Provisioning by hand from the
            customers screen is unaffected — a price agreed there is the price typed there.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="default-plan">Starting plan</Label>
            <Select
              value={form.default_plan_id}
              onValueChange={(value) => setForm({ ...form, default_plan_id: value })}
            >
              <SelectTrigger id="default-plan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PLAN}>Nothing — set them up by hand</SelectItem>
                {settings.plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — ${plan.price_usd}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {provisions
                ? "They are on a plan the moment they sign up."
                : "They get in, and show up as unprovisioned on the customers screen until somebody puts them on a plan."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trial-days">Trial length</Label>
            <div className="flex items-center gap-2">
              <Input
                id="trial-days"
                type="number"
                min={0}
                max={365}
                value={form.default_trial_days}
                disabled={!provisions}
                onChange={(event) =>
                  setForm({ ...form, default_trial_days: Number(event.target.value) })
                }
                className="w-28"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {!provisions
                ? "Nothing to time until there is a starting plan."
                : form.default_trial_days === 0
                  ? "No trial — they start as a paying customer straight away."
                  : `They can use everything for ${form.default_trial_days} days before the plan has to be paid for.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <Button onClick={() => save()} disabled={isPending}>
          Save settings
        </Button>
        <span className="text-xs text-muted-foreground">
          Last changed {formatDistanceToNow(parseISO(settings.updated_at), { addSuffix: true })}.
          Every change is recorded on{" "}
          <Link
            href="/platform/activity"
            className="text-primary underline-offset-4 hover:underline"
          >
            admin activity
          </Link>
          .
        </span>
      </div>
    </div>
  )
}

export default PlatformSettings
