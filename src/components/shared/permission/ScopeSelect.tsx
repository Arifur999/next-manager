"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SCOPE_INFO, SCOPE_VALUES, type PermissionScope } from "@/types/permission.types"

/**
 * How far one square reaches.
 *
 * The only control on this screen that writes anything, so it is one component
 * rather than one per table — the role grid and the person grid differ in what
 * a change MEANS, never in what the picker offers.
 *
 * `inherit` is offered only where inheriting is a real answer: on a person,
 * where clearing the override is a different act from setting the same value
 * the role already has.
 */

export const INHERIT = "__inherit__"

interface ScopeSelectProps {
  value: PermissionScope | typeof INHERIT
  onChange: (value: PermissionScope | typeof INHERIT) => void
  /** The role's value, shown beside "Inherit" so the effect is never a guess. */
  inheritedFrom?: PermissionScope
  disabled?: boolean
  label: string
}

const ScopeSelect = ({
  value,
  onChange,
  inheritedFrom,
  disabled,
  label,
}: ScopeSelectProps) => (
  <Select
    value={value}
    onValueChange={(next) => onChange(next as PermissionScope | typeof INHERIT)}
    disabled={disabled}
  >
    <SelectTrigger size="sm" className="w-full min-w-28" aria-label={label}>
      {/*
        The text is passed rather than left to Radix to infer. Radix reads it
        off the selected item, which does not exist until the list has mounted,
        so a table this size renders as a screen of blank pickers and only fills
        in on hydration. The component already knows what the value means.
      */}
      <SelectValue>
        {value === INHERIT
          ? `Inherit${inheritedFrom ? ` — ${SCOPE_INFO[inheritedFrom].label.toLowerCase()}` : ""}`
          : SCOPE_INFO[value].label}
      </SelectValue>
    </SelectTrigger>

    <SelectContent>
      {inheritedFrom && (
        <SelectItem value={INHERIT}>
          Inherit
          <span className="text-muted-foreground">
            {" "}
            — {SCOPE_INFO[inheritedFrom].label.toLowerCase()}
          </span>
        </SelectItem>
      )}

      {SCOPE_VALUES.map((scope) => (
        <SelectItem key={scope} value={scope}>
          {SCOPE_INFO[scope].label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default ScopeSelect
