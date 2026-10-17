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
  roleTitle,
  type IPermissionGrid,
} from "@/types/permission.types"

// One role's template: a change moves everybody in the role who has no exception.

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
            label={`${roleTitle(role)}: ${ACTION_LABEL[action] ?? action} ${MODULE_LABEL[module] ?? module}`}
            value={scope}
            disabled={disabled}
            onChange={(next) =>
              save({
                run: () =>
                  setRolePermissionAction({
                    role,
                    module,
                    action,
                    scope: next,
                  }),
                note: `${roleTitle(role)} — ${MODULE_LABEL[module] ?? module} ${action} saved`,
              })
            }
          />
        )
      }}
    />
  )
}

export default RolePermissionGrid
