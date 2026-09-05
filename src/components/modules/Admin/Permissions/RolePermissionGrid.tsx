"use client"

import {
  setRolePermissionAction,
} from "@/app/(dashboardLayout)/admin/dashboard/permissions/_action"
import PermissionGrid from "@/components/shared/permission/PermissionGrid"
import ScopeSelect from "@/components/shared/permission/ScopeSelect"
import { scopeAt } from "@/components/shared/permission/usePermissionGrid"
import {
  ACTION_LABEL,
  MODULE_LABEL,
  ROLE_LABEL,
  titleise,
  type IPermissionGrid,
  type PermissionScope,
} from "@/types/permission.types"

/**
 * What everybody in one role starts with.
 *
 * This is the template, so a change here moves every person in that role who
 * has not been given an exception. The person tab is where one individual is
 * treated differently.
 */

interface RolePermissionGridProps {
  grid: IPermissionGrid
  role: string
  disabled: boolean
  save: (input: { run: () => Promise<{ success: boolean; message?: string }>; note: string }) => void
}

const RolePermissionGrid = ({ grid, role, disabled, save }: RolePermissionGridProps) => {
  const rows = grid.role_permissions.filter((row) => row.role === role)

  return (
    <PermissionGrid
      catalogue={grid.catalogue}
      renderCell={(module, action) => {
        const scope = scopeAt(rows, module, action) ?? "none"

        return (
          <ScopeSelect
            label={`${ROLE_LABEL[role] ?? titleise(role)}: ${ACTION_LABEL[action] ?? action} ${MODULE_LABEL[module] ?? module}`}
            value={scope}
            disabled={disabled}
            onChange={(next) =>
              save({
                run: () =>
                  setRolePermissionAction({
                    role,
                    module,
                    action,
                    scope: next as PermissionScope,
                  }),
                note: `${ROLE_LABEL[role] ?? titleise(role)} — ${MODULE_LABEL[module] ?? module} ${action} saved`,
              })
            }
          />
        )
      }}
    />
  )
}

export default RolePermissionGrid
