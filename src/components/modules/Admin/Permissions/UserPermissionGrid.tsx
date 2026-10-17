"use client"

import {
  clearUserPermissionAction,
  setUserPermissionAction,
} from "@/app/(dashboardLayout)/admin/dashboard/permissions/_action"
import PermissionGrid from "@/components/shared/permission/PermissionGrid"
import ScopeSelect, { INHERIT } from "@/components/shared/permission/ScopeSelect"
import { scopeAt } from "@/components/shared/permission/usePermissionGrid"
import {
  ACTION_LABEL,
  MODULE_LABEL,
  roleTitle,
  type IPermissionGrid,
} from "@/types/permission.types"

// One person's exceptions. "Inherit" is no override at all, not a copy of the role's
// value, so choosing it again deletes the override and they follow the role again.

interface UserPermissionGridProps {
  grid: IPermissionGrid
  disabled: boolean
  save: (input: { run: () => Promise<{ success: boolean; message?: string }>; note: string }) => void
}

const UserPermissionGrid = ({ grid, disabled, save }: UserPermissionGridProps) => {
  const person = grid.user
  if (!person) return null

  const roleRows = grid.role_permissions.filter((row) => row.role === person.role)

  return (
    <PermissionGrid
      catalogue={grid.catalogue}
      renderCell={(module, action) => {
        const inherited = scopeAt(roleRows, module, action) ?? "none"
        const override = scopeAt(grid.user_permissions, module, action)

        return (
          <ScopeSelect
            label={`${person.full_name}: ${ACTION_LABEL[action] ?? action} ${MODULE_LABEL[module] ?? module}`}
            value={override ?? INHERIT}
            inheritedFrom={inherited}
            disabled={disabled}
            onChange={(next) =>
              save(
                next === INHERIT
                  ? {
                      run: () => clearUserPermissionAction(person.id, module, action),
                      note: `${person.full_name} follows ${roleTitle(person.role)} again here`,
                    }
                  : {
                      run: () =>
                        setUserPermissionAction(person.id, {
                          module,
                          action,
                          scope: next,
                        }),
                      note: `${person.full_name} — ${MODULE_LABEL[module] ?? module} ${action} saved`,
                    },
              )
            }
          />
        )
      }}
    />
  )
}

export default UserPermissionGrid
