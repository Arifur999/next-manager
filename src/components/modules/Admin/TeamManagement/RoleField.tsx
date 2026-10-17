"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ASSIGNABLE_ROLES, ROLE_LABELS, isAssignableRole, type AssignableRole } from "@/zod/user.validation"

/**
 * The role picker, shared by the create and edit forms so both offer exactly
 * the roles an admin may grant.
 */
const RoleField = ({
  value,
  onChange,
  disabled,
}: {
  value: AssignableRole
  onChange: (role: AssignableRole) => void
  disabled?: boolean
}) => (
  <div className="space-y-1.5">
    <Label htmlFor="role">Role</Label>
    <Select
      value={value}
      onValueChange={(next) => {
        if (isAssignableRole(next)) onChange(next)
      }}
      disabled={disabled}
    >
      <SelectTrigger id="role" className="w-full">
        <SelectValue placeholder="Choose a role" />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {ROLE_LABELS[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export default RoleField
