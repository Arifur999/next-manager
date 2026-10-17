"use client"

import { site } from "@/data/site"
import { setNotificationRuleAction } from "@/app/(dashboardLayout)/admin/dashboard/notifications/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { INotificationRule } from "@/types/workspace.types"
import { useQuery } from "@tanstack/react-query"
import { BellRing } from "lucide-react"
import Link from "next/link"
import { notificationRulesQuery } from "@/queries/workspace.queries"
import { queryKeys } from "@/lib/queryKeys"
import { NOTIFICATION_AUDIENCE_ROLES } from "@/zod/workspace.validation"

/**
 * What the company tells its own people about.
 *
 * Every switch here starts on its built-in default rather than off. An agency
 * that never opens this screen still gets what matters — an absent setting is
 * not silence, and a screen that showed five switches on one agency and none on
 * another, for the same product, would be one nobody could be told how to use.
 *
 * A directed event has no audience picker. A task assignment goes to whoever it
 * was handed to, whatever their role, so a role picker there would be a control
 * that does nothing — the server drops one if it is sent.
 */

const roleLabel = (role: string) => role.replace(/_/g, " ")

type RuleChange = { in_app?: boolean; email?: boolean; roles?: string[] }

const NotificationRules = () => {
  const { data, isLoading } = useQuery(notificationRulesQuery())

  const rules = data?.data ?? []

  const { run: saveRule, isPending } = useActionMutation({
    action: ({ event, change }: { event: string; change: RuleChange }) =>
      setNotificationRuleAction(event, change),
    // The switch flipping is the confirmation.
    successMessage: false,
    invalidateKeys: [queryKeys.notificationRules.all],
    refresh: false,
  })

  if (isLoading && rules.length === 0) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  const toggleRole = (rule: INotificationRule, role: string, on: boolean) =>
    void saveRule({
      event: rule.event,
      change: {
        roles: on ? [...rule.roles, role] : rule.roles.filter((value) => value !== role),
      },
    })

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.event} className="gap-0 overflow-hidden p-0">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <CardTitle className="text-base">{rule.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{rule.description}</p>
            </div>

            {!rule.customised && (
              // Says the setting is the built-in one rather than something
              // somebody chose, so nobody wonders whether it was ever set.
              <Badge variant="outline">default</Badge>
            )}
          </CardHeader>

          <div className="space-y-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id={`${rule.event}-in-app`}
                  className="mt-0.5"
                  checked={rule.in_app}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    void saveRule({ event: rule.event, change: { in_app: checked === true } })
                  }
                />
                <Label htmlFor={`${rule.event}-in-app`} className="font-normal">
                  In the bell
                  <span className="block text-xs text-muted-foreground">
                    Off means nobody hears about it at all.
                  </span>
                </Label>
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id={`${rule.event}-email`}
                  className="mt-0.5"
                  checked={rule.email}
                  disabled={isPending || !rule.in_app}
                  onCheckedChange={(checked) =>
                    void saveRule({ event: rule.event, change: { email: checked === true } })
                  }
                />
                <Label htmlFor={`${rule.event}-email`} className="font-normal">
                  By email as well
                  <span className="block text-xs text-muted-foreground">
                    {/* Off by default everywhere: email leaves the product and
                        cannot be unsent. */}
                    Off by default — email leaves the product and cannot be unsent.
                  </span>
                </Label>
              </div>
            </div>

            {rule.kind === "broadcast" ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Who hears it</Label>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_AUDIENCE_ROLES.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      size="sm"
                      variant={rule.roles.includes(role) ? "default" : "outline"}
                      className="capitalize"
                      disabled={isPending || !rule.in_app}
                      aria-pressed={rule.roles.includes(role)}
                      onClick={() => toggleRole(rule, role, !rule.roles.includes(role))}
                    >
                      {roleLabel(role)}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Goes to the person it concerns, whatever their role — so there is nobody
                else to choose.
              </p>
            )}
          </div>
        </Card>
      ))}

      <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <BellRing className="size-4 shrink-0" aria-hidden="true" />
        These arrive in the same bell as notices from {site.name}, so there is one place to
        look and one count to clear. Announcements to your own clients are a different
        thing —{" "}
        <Link
          href="/admin/dashboard/business"
          className="text-primary underline-offset-4 hover:underline"
        >
          your business details
        </Link>{" "}
        are what appear on those.
      </p>
    </div>
  )
}

export default NotificationRules
