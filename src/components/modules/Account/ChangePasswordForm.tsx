"use client"

import { changePasswordAction } from "@/app/(dashboardLayout)/change-password/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Changing your own password.
 *
 * The server bumps token_version on success, which retires every token issued
 * before that moment — including sessions open on other devices. That is the
 * point of changing a password, but it also means THIS session's token is dead
 * the instant the request succeeds, so the only correct next step is to send
 * the person to sign in again. Staying on the page would leave them clicking
 * around a UI whose every request is about to 401.
 */

const RULES = "At least 8 characters, with a letter and a number."

const ChangePasswordForm = () => {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      changePasswordAction({ old_password: oldPassword, new_password: newPassword }),
    onSuccess: (result) => {
      if (!result.success) {
        // "Current password is incorrect" comes from the server and is the
        // only useful thing to say here, so it is passed through.
        toast.error(result.message || "Could not change your password")
        return
      }

      toast.success("Password changed. Sign in again with the new one.")
      router.replace("/login")
    },
  })

  // Checked here as well as on the server: making somebody submit a form to be
  // told they mistyped the confirmation is a round-trip for nothing.
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const tooShort = newPassword.length > 0 && newPassword.length < 8
  const ready =
    oldPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Change password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Changing it signs you out everywhere, including any session left open on
          another device.
        </p>
      </CardHeader>

      <form
        className="max-w-md space-y-5 p-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready) return
          submit()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="old-password">Current password</Label>
          <Input
            id="old-password"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={isPending}
            required
            aria-describedby="new-password-rules"
          />
          <p
            id="new-password-rules"
            className={`text-xs ${tooShort ? "text-destructive" : "text-muted-foreground"}`}
          >
            {RULES}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isPending}
            required
            aria-invalid={mismatch}
          />
          {mismatch && <p className="text-xs text-destructive">These do not match.</p>}
        </div>

        <Button type="submit" disabled={isPending || !ready}>
          {isPending ? "Changing..." : "Change password"}
        </Button>
      </form>
    </Card>
  )
}

export default ChangePasswordForm
