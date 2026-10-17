"use client"

import {
  approvePlatformAdminAction,
  removePlatformAdminAction,
  setPermissionsAction,
} from "@/app/(dashboardLayout)/platform/_teamAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_INFO,
  type IPlatformAdmin,
  type PlatformPermission,
} from "@/types/platform.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { platformAdminsQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Who is on the platform team and what each of them may do.
 *
 * An empty permission list means full access, not none: that is the hatch in
 * requirePermission which stops the first operator locking themselves out. The
 * row says so in words, and ticking the first box is what narrows access.
 */

// Read off the permission list, in the order permissions are handed out, so a
// new area cannot be left out of the editor.
const AREAS = [...new Set(PLATFORM_PERMISSIONS.map((permission) => PLATFORM_PERMISSION_INFO[permission].area))]

const byArea = (area: string) =>
  PLATFORM_PERMISSIONS.filter((permission) => PLATFORM_PERMISSION_INFO[permission].area === area)

// Every change to the team is written to the activity feed, so both refetch.
const TEAM_KEYS = [queryKeys.platformAdmins.all, queryKeys.platformActivity.all]

type AdminRowProps = { admin: IPlatformAdmin; canRemove: boolean; isYou: boolean }

const AdminRow = ({ admin, canRemove, isYou }: AdminRowProps) => {
  const [draft, setDraft] = useState<string[]>(admin.permissions)
  const [editing, setEditing] = useState(false)
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false)

  const { run: saveAccess, isPending } = useActionMutation({
    action: (permissions: string[]) => setPermissionsAction(admin.id, permissions),
    successMessage: `${admin.full_name}'s access updated`,
    invalidateKeys: TEAM_KEYS,
    refresh: false,
  })

  const { run: approveOperator, isPending: isApproving } = useActionMutation({
    action: approvePlatformAdminAction,
    successMessage: `${admin.full_name} can sign in now`,
    invalidateKeys: TEAM_KEYS,
    refresh: false,
  })

  const { run: removeOperator, isPending: isRemoving } = useActionMutation({
    action: removePlatformAdminAction,
    successMessage: `${admin.full_name} removed`,
    invalidateKeys: TEAM_KEYS,
    refresh: false,
  })

  const handleRemove = async () => {
    if (await removeOperator(admin.id)) setIsConfirmingRemoval(false)
  }

  const handleSave = async () => {
    if (await saveAccess(draft)) setEditing(false)
  }

  const toggle = (permission: PlatformPermission, on: boolean) =>
    setDraft((current) =>
      on ? [...current, permission] : current.filter((value) => value !== permission),
    )

  const hasFullAccess = admin.permissions.length === 0
  // Narrowing your own full access from here could leave nobody able to manage the team.
  const isOwnFullAccess = isYou && hasFullAccess
  const busy = isPending || isApproving || isRemoving

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {admin.full_name}
            {isYou && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
            {admin.status === "pending" && (
              <Badge variant="outline" className="ml-2 text-[10px]">
                waiting for approval
              </Badge>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {admin.email} · joined {format(parseISO(admin.created_at), "d MMM yyyy")}
          </p>

          <p className="mt-1.5 text-xs">
            {hasFullAccess ? (
              // Said in words. Seven unticked boxes read as "has nothing",
              // which is the opposite of what an empty list means.
              <span className="font-medium text-foreground">Full access to every part of the console</span>
            ) : (
              <span className="text-muted-foreground">
                {admin.permissions.length} of {PLATFORM_PERMISSIONS.length} areas
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {admin.status === "pending" && (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void approveOperator(admin.id)}
            >
              Approve
            </Button>
          )}
          {isOwnFullAccess ? (
            <span className="max-w-56 text-right text-xs text-muted-foreground">
              Your own full access is not changed here, so the team always keeps someone who can manage it.
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                setDraft(admin.permissions)
                setEditing((open) => !open)
              }}
            >
              {editing ? "Cancel" : "Change access"}
            </Button>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setIsConfirmingRemoval(true)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Leave every box unticked for full access. Ticking any box{" "}
            <span className="font-medium text-foreground">narrows</span> what they can reach to the ticked areas.
          </p>

          {AREAS.map((area) => (
            <div key={area} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {area}
              </p>

              {byArea(area).map((permission) => {
                const info = PLATFORM_PERMISSION_INFO[permission]
                const id = `${admin.id}-${permission}`

                return (
                  <div key={permission} className="flex items-start gap-2.5">
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={draft.includes(permission)}
                      onCheckedChange={(checked) => toggle(permission, checked === true)}
                      disabled={isPending}
                    />
                    <div className="min-w-0">
                      <Label htmlFor={id} className="font-normal">
                        {info.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <Button type="button" size="sm" disabled={isPending} onClick={() => void handleSave()}>
              {isPending ? "Saving..." : "Save access"}
            </Button>
            {draft.length === 0 && (
              <span className="text-xs text-muted-foreground">
                Saving with nothing ticked gives full access.
              </span>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmingRemoval}
        onOpenChange={setIsConfirmingRemoval}
        title={`Remove ${admin.full_name} from the platform team?`}
        description="They lose access to this console straight away. What they did stays in the activity log."
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
      />
    </li>
  )
}

const PlatformTeam = ({ currentUserId }: { currentUserId: string | undefined }) => {
  const team = useQuery(platformAdminsQuery())

  const admins = team.data?.data ?? []
  const activeCount = admins.filter((admin) => admin.status === "active").length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <PanelState
        query={team}
        errorMessage="The platform team did not load."
        isEmpty={admins.length === 0}
        empty={<EmptyState icon={ShieldCheck}>Nobody is on the platform team.</EmptyState>}
      >
        <ul className="divide-y">
          {admins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              // The server refuses removing the last active operator anyway;
              // hiding the button means nobody clicks it to find out.
              canRemove={!(admin.status === "active" && activeCount <= 1)}
              isYou={admin.id === currentUserId}
            />
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default PlatformTeam
