"use client"

import AppField from "@/components/shared/form/AppField"
import { Button } from "@/components/ui/button"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

// A password somebody is choosing: masked, with a toggle to check what they typed.
const PasswordField = ({
  field,
  label,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  disabled: boolean
}) => {
  const [isShown, setIsShown] = useState(false)

  return (
    <div className="relative">
      <AppField
        field={field}
        label={label}
        type={isShown ? "text" : "password"}
        autoComplete="new-password"
        placeholder="At least 8 characters, with a letter and a number"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-7"
        onClick={() => setIsShown((shown) => !shown)}
        aria-label={isShown ? "Hide password" : "Show password"}
      >
        {isShown ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </Button>
    </div>
  )
}

export default PasswordField
