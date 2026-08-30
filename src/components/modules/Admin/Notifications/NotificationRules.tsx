"use client"

import { setNotificationRuleAction } from "@/app/(dashboardLayout)/admin/dashboard/notifications/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getNotificationRules } from "@/services/agencio.services"
import type { INotificationRule } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BellRing } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

const AUDIENCE_ROLES = ["admin", "sales", "project_manager", "operations"] as const

const roleLabel = (role: string) => role.replace(/_/g, " ")

const NotificationRules = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notification-rules"],
    queryFn: () => getNotificationRules(),
  })

  const rules = (data?.data ?? []) as INotificationRule[]

  const { mutate: save, isPending } = useMutation({
    mutationFn: ({ event, payload }: { event: string; payload: Record<string, unknown> }) =>
      setNotificationRuleAction(event, payload),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save that")
        return
      }
      void queryClient.invalidateQueries({ queryKey: ["notification-rules"] })
    },
  })

  if (isLoading && rules.length === 0) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  const toggleRole = (rule: INotificationRule, role: string, on: boolean) =>
    save({
      event: rule.event,
      payload: {
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
                    save({ event: rule.event, payload: { in_app: checked === true } })
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
                    save({ event: rule.event, payload: { email: checked === true } })
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
                  {AUDIENCE_ROLES.map((role) => (
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
        These arrive in the same bell as notices from AGENCIO, so there is one place to
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
