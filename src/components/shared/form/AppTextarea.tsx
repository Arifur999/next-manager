import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AnyFieldApi } from "@tanstack/react-form"

type AppTextareaProps = {
  field: AnyFieldApi
  label: string
  placeholder?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
}

const errorText = (error: unknown): string => {
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }
  return String(error)
}

// AppField for longer text (notes, descriptions): the same label and the same
// error after touch, on a textarea.
const AppTextarea = ({ field, label, placeholder, rows = 3, maxLength, disabled = false }: AppTextareaProps) => {
  const firstError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0 ? errorText(field.state.meta.errors[0]) : null
  const errorId = `${field.name}-error`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name} className={cn(firstError && "text-destructive")}>
        {label}
      </Label>
      <Textarea
        id={field.name}
        name={field.name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        disabled={disabled}
        aria-invalid={firstError !== null}
        aria-describedby={firstError ? errorId : undefined}
      />
      {firstError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {firstError}
        </p>
      )}
    </div>
  )
}

export default AppTextarea
