"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ACTION_LABEL,
  MODULE_LABEL,
  titleise,
  type IPermissionCatalogue,
} from "@/types/permission.types"
import type { ReactNode } from "react"

/**
 * Modules down, actions across.
 *
 * One table for both the role template and a person's overrides, because the
 * two differ only in what a cell contains — and a second copy of this markup
 * would be a second place for the columns to drift out of step with the
 * catalogue.
 *
 * A square the catalogue does not list is a dash, not an empty picker. There is
 * no such thing as "assign a report", and offering a scope for it would invite
 * somebody to set a value the server would refuse.
 */

interface PermissionGridProps {
  catalogue: IPermissionCatalogue
  renderCell: (module: string, action: string) => ReactNode
}

const PermissionGrid = ({ catalogue, renderCell }: PermissionGridProps) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-32">Module</TableHead>
          {catalogue.actions.map((action) => (
            <TableHead key={action} className="min-w-32">
              {ACTION_LABEL[action] ?? titleise(action)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {catalogue.modules.map(({ module, actions }) => (
          <TableRow key={module}>
            <TableCell className="font-medium">
              {MODULE_LABEL[module] ?? titleise(module)}
            </TableCell>

            {catalogue.actions.map((action) => (
              <TableCell key={action}>
                {actions.includes(action) ? (
                  renderCell(module, action)
                ) : (
                  <span className="text-muted-foreground" aria-label="not applicable">
                    —
                  </span>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export default PermissionGrid
