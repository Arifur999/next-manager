"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectOption = {
  value: string
  label: string
  /** A second line under the label — an account's currency, a project's code. */
  hint?: string
}

type EntitySelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  /** Shown under the field — used to explain a currency restriction. */
  description?: string
  emptyMessage?: string
  error?: string | null
}

/**
 * A labelled picker over a list fetched from the API.
 *
 * Renders the empty case as disabled text rather than an empty dropdown: "no
 * USD accounts yet" tells the user what to do, an empty list does not.
 */
const EntitySelect = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Choose one",
  disabled,
  description,
  emptyMessage = "Nothing to choose from yet",
  error,
}: EntitySelectProps) => {
  const isEmpty = options.length === 0

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? "text-destructive" : undefined}>
        {label}
      </Label>

      <Select value={value} onValueChange={onChange} disabled={disabled || isEmpty}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={isEmpty ? emptyMessage : placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex flex-col items-start">
                <span>{option.label}</span>
                {option.hint && (
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export default EntitySelect
