"use client"

import { setPermissionsAction } from "@/app/(dashboardLayout)/admin/dashboard/permissions/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getAllUsers } from "@/services/user.services"
import {
  COMPANY_PERMISSIONS,
  COMPANY_PERMISSION_INFO,
  type IUser,
} from "@/types/user.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * What each colleague may do inside the role they already have.
 *
 * Two things this screen has to say plainly, because both read backwards
 * otherwise.
 *
 * **Nothing ticked means everything the role allows** — not nothing. That is
 * where everybody starts, and it is why turning this layer on took nothing away
 * from anybody.
 *
 * **Ticking one box is a restriction, not a grant.** It flips somebody from
 * "everything your role allows" to "only these". Somebody expecting to hand out
 * one extra capability would otherwise take six away by accident.
 *
 * Admins are listed but not editable: they pass every check by design, so a
 * list stored against one would look like a restriction and enforce nothing.
 */

const PermissionsBoard = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Record<string, string[]>>({})

  const { data, isLoading } = useQuery({
    queryKey: ["users", ""],
    queryFn: () => getAllUsers(),
  })

  const users = (data?.data ?? []) as IUser[]

  const { mutate: save, isPending } = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      setPermissionsAction(id, permissions),
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.message || "Could not update access")
        return
      }

      toast.success(
        variables.permissions.length === 0
          ? "Back to everything their role allows"
          : `Limited to ${variables.permissions.length} thing${variables.permissions.length === 1 ? "" : "s"}`
      )

      setDraft((current) => {
        const next = { ...current }
        delete next[variables.id]
        return next
      })

      void queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const permissionsOf = (user: IUser) => draft[user.id] ?? user.permissions ?? []
  const isDirty = (user: IUser) => draft[user.id] !== undefined

  const toggle = (user: IUser, permission: string, on: boolean) => {
    const current = permissionsOf(user)
    setDraft({
      ...draft,
      [user.id]: on ? [...current, permission] : current.filter((value) => value !== permission),
    })
  }

  if (isLoading && users.length === 0) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const permissions = permissionsOf(user)
        const unrestricted = permissions.length === 0
        const isAdmin = user.role === "admin"

        return (
          <Card key={user.id} className="gap-0 overflow-hidden p-0">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
              <div>
                <CardTitle className="text-base">{user.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {user.email} · <span className="capitalize">{user.role.replace(/_/g, " ")}</span>
                  {user.department ? ` · ${user.department.name}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Badge variant="secondary">passes every check</Badge>
                ) : unrestricted ? (
                  <Badge variant="secondary">everything their role allows</Badge>
                ) : (
                  <Badge variant="outline">
                    limited to {permissions.length}
                  </Badge>
                )}

                {isDirty(user) && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => save({ id: user.id, permissions })}
                  >
                    Save
                  </Button>
                )}
              </div>
            </CardHeader>

            {isAdmin ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">
                An admin reaches everything in their own company, and there is no way back in
                if that were switched off with a checkbox. Change their role first if you
                want to limit them.
              </p>
            ) : (
              <div className="space-y-3 px-5 py-4">
                <p className="text-xs text-muted-foreground">
                  {unrestricted
                    ? "Nothing ticked means everything their role allows — which is where everybody starts. Tick one and they are limited to what is ticked."
                    : "Limited to what is ticked. Untick everything to give their whole role back."}
                </p>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {COMPANY_PERMISSIONS.map((permission) => {
                    const info = COMPANY_PERMISSION_INFO[permission]
                    const id = `${user.id}-${permission}`

                    return (
                      <div key={permission} className="flex items-start gap-2.5">
                        <Checkbox
                          id={id}
                          className="mt-0.5"
                          checked={permissions.includes(permission)}
                          onCheckedChange={(checked) => toggle(user, permission, checked === true)}
                          disabled={isPending}
                        />
                        <Label htmlFor={id} className="font-normal">
                          {info.label}
                          <span className="block text-xs text-muted-foreground">
                            {info.area} — {info.description}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>
        )
      })}

      {users.length === 0 && (
        <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <ShieldCheck className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Nobody to set access for yet.</p>
        </Card>
      )}
    </div>
  )
}

export default PermissionsBoard
