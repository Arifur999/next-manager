"use client"

import AppField from "@/components/shared/form/AppField"
import { NEW_PASSWORD_RULES } from "@/zod/formFields"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

// "new" is a password somebody is choosing, so the rules show before they type;
// "current" is the one they sign in with, where the rules would only be noise.
const PasswordField = ({
  field,
  label,
  disabled,
  purpose = "new",
}: {
  field: AnyFieldApi
  label: string
  disabled: boolean
  purpose?: "new" | "current"
}) => {
  const [isShown, setIsShown] = useState(false)

  return (
    <AppField
      field={field}
      label={label}
      type={isShown ? "text" : "password"}
      autoComplete={purpose === "new" ? "new-password" : "current-password"}
      description={purpose === "new" ? NEW_PASSWORD_RULES : undefined}
      disabled={disabled}
      append={
        <button
          type="button"
          onClick={() => setIsShown((shown) => !shown)}
          className="-mr-1.5 inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={isShown ? "Hide password" : "Show password"}
        >
          {isShown ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </button>
      }
    />
  )
}

export default PasswordField
