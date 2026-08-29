"use client"

import {
  approvePlatformAdminAction,
  removePlatformAdminAction,
  setPermissionsAction,
} from "@/app/(dashboardLayout)/platform/_teamAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getPlatformAdmins } from "@/services/agencio.services"
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_INFO,
  type IPlatformAdmin,
  type PlatformPermission,
} from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Who is on the platform team and what each of them may do.
 *
 * The thing this screen must not get wrong: **an empty permission list means
 * full access, not none.** That is the hatch in requirePermission which stops
 * the first operator locking themselves out, and the opposite reading is the
 * obvious one — so the row says it in words rather than showing seven unticked
 * boxes and letting somebody conclude the person has nothing.
 *
 * Ticking the first box is therefore a *narrowing*, and the screen says that
 * too. It is the moment access actually changes.
 */

// Grouped in the order permissions are handed out, not alphabetically.
const AREAS = ["Companies", "Plans", "Finance", "Team", "Customers"] as const

const byArea = (area: string) =>
  PLATFORM_PERMISSIONS.filter((permission) => PLATFORM_PERMISSION_INFO[permission].area === area)

const AdminRow = ({ admin, canRemove }: { admin: IPlatformAdmin; canRemove: boolean }) => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<string[]>(admin.permissions)
  const [editing, setEditing] = useState(false)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["platform-admins"] })
    void queryClient.invalidateQueries({ queryKey: ["platform-activity"] })
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => setPermissionsAction(admin.id, draft),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not update access")
        return
      }
      toast.success(`${admin.full_name}'s access updated`)
      setEditing(false)
      refresh()
    },
  })

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approvePlatformAdminAction(admin.id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not approve")
        return
      }
      toast.success(`${admin.full_name} can sign in now`)
      refresh()
    },
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => removePlatformAdminAction(admin.id),
    onSuccess: (result) => {
      if (!result.success) {
        // "This is the last active platform operator" arrives here.
        toast.error(result.message || "Could not remove")
        return
      }
      toast.success(`${admin.full_name} removed`)
      refresh()
    },
  })

  const toggle = (permission: PlatformPermission, on: boolean) =>
    setDraft((current) =>
      on ? [...current, permission] : current.filter((value) => value !== permission),
    )

  const hasFullAccess = admin.permissions.length === 0
  const busy = isPending || isApproving || isRemoving

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {admin.full_name}
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
              <span className="font-medium text-foreground">
                Full access — every part of the console
              </span>
            ) : (
              <span className="text-muted-foreground">
                {admin.permissions.length} of {PLATFORM_PERMISSIONS.length} areas
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {admin.status === "pending" && (
            <Button type="button" size="sm" disabled={busy} onClick={() => approve()}>
              Approve
            </Button>
          )}
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
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => remove()}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Leave every box unticked for full access. Ticking the first one{" "}
            <span className="font-medium text-foreground">narrows</span> what they can
            reach — that is the moment their access actually changes.
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
            <Button type="button" size="sm" disabled={isPending} onClick={() => save()}>
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
    </li>
  )
}

const PlatformTeam = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-admins"],
    queryFn: () => getPlatformAdmins(),
  })

  const admins = (data?.data ?? []) as IPlatformAdmin[]
  const activeCount = admins.filter((admin) => admin.status === "active").length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Platform team
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Everyone who can reach this console. Each of them can see every customer, so
          this is the shortest list you should be able to keep it.
        </p>
      </CardHeader>

      {isLoading && admins.length === 0 ? (
        <div className="h-32 animate-pulse bg-muted/40" />
      ) : (
        <ul className="divide-y">
          {admins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              // The server refuses removing the last active operator anyway;
              // hiding the button means nobody clicks it to find out.
              canRemove={!(admin.status === "active" && activeCount <= 1)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default PlatformTeam
