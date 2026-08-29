"use client"

import { updateMeAction } from "@/app/(dashboardLayout)/my-profile/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_LABELS } from "@/zod/user.validation"
import type { IUser } from "@/types/user.types"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Your own record.
 *
 * Three editable fields, matching the server's allow-list exactly. Role and
 * email are shown but not editable, and are shown rather than hidden because
 * "which role am I" is the question this page gets opened to answer more often
 * than "I want to change my phone number".
 *
 * Email is read-only because it is the login identifier — changing it is
 * account recovery, not a profile edit, and a form that let you type over it
 * would be promising something the server will not do.
 */

const ProfileForm = ({ user }: { user: IUser }) => {
  const router = useRouter()
  const [fullName, setFullName] = useState(user.full_name)
  const [phone, setPhone] = useState(user.phone ?? "")

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateMeAction({ full_name: fullName.trim(), phone: phone.trim() }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save your profile")
        return
      }
      toast.success("Profile updated")
      // The sidebar and navbar read the user server-side, so the tree has to
      // re-render for the new name to appear anywhere but this form.
      router.refresh()
    },
  })

  const dirty = fullName.trim() !== user.full_name || phone.trim() !== (user.phone ?? "")

  // ROLE_LABELS covers the roles an admin can assign. super_admin is not one
  // of them but does own an account, so it falls back to its own value rather
  // than being indexed for and coming back undefined.
  const roleLabel =
    user.role in ROLE_LABELS
      ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]
      : user.role.replace(/_/g, " ")

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Your details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your name is what colleagues see on approvals, timesheets and assignments.
        </p>
      </CardHeader>

      <form
        className="space-y-5 p-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!fullName.trim()) return
          save()
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              This is how you sign in. An admin has to change it.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="flex h-9 items-center">
              <Badge variant="secondary">{roleLabel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              What you can reach. Only an admin can change it.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isPending || !dirty || !fullName.trim()}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  )
}

export default ProfileForm
