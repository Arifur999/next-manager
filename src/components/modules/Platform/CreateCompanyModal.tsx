"use client"

import { createCompanyAction } from "@/app/(dashboardLayout)/platform/_action"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPlans } from "@/services/agencio.services"
import type { IPlan } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Provisioning a company by hand.
 *
 * For a customer who agreed a price before ever seeing the sign-up form. It
 * creates the workspace, its first admin and its subscription together,
 * because a workspace nobody can sign in to is not a workspace.
 *
 * The password is set here and handed over out of band. That is not ideal and
 * the copy says so — the admin should change it, and the reset flow exists for
 * exactly this. Emailing an invite instead would be better and is a bigger
 * change than this screen.
 */

const DEFAULT_PLAN = "__default__"

const CreateCompanyModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [password, setPassword] = useState("")
  const [planId, setPlanId] = useState(DEFAULT_PLAN)
  const [trialDays, setTrialDays] = useState("14")

  const { data: plansData } = useQuery({
    queryKey: ["platform-plans"],
    queryFn: () => getPlans(),
    enabled: open,
  })

  const plans = (plansData?.data ?? []) as IPlan[]

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      createCompanyAction({
        name: name.trim(),
        admin_name: adminName.trim(),
        admin_email: adminEmail.trim(),
        admin_password: password,
        ...(planId === DEFAULT_PLAN ? {} : { plan_id: planId }),
        // Blank means no trial, which is the usual case for a company
        // provisioned by hand - it has already agreed to pay.
        ...(trialDays.trim() === "" ? {} : { trial_days: Number(trialDays) }),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        // "One address cannot admin two companies" is the server's wording and
        // the only useful thing to say.
        toast.error(result.message || "Could not create the company")
        return
      }

      toast.success(`${name} created. Send them the password out of band.`)
      setOpen(false)
      setName("")
      setAdminName("")
      setAdminEmail("")
      setPassword("")
      void queryClient.invalidateQueries({ queryKey: ["platform-companies"] })
      void queryClient.invalidateQueries({ queryKey: ["platform-overview"] })
    },
  })

  const ready = name.trim() && adminName.trim() && adminEmail.trim() && password.length >= 8

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          New company
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a company</DialogTitle>
          <DialogDescription>
            Sets up the workspace, its first admin and its subscription in one go. You
            hand the password over yourself — they should change it, and the reset flow
            is there if they do not.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!ready) return
            create()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Bright Pixel Agency"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Admin&apos;s name</Label>
              <Input
                id="admin-name"
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Admin&apos;s email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Starting password</Label>
            <Input
              id="admin-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters, with a letter and a number"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Not hidden, because you have to read it to pass it on.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-plan">Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger id="company-plan" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_PLAN}>Cheapest active plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.price_usd}/mo)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trial-days">Trial (days)</Label>
              <Input
                id="trial-days"
                type="number"
                value={trialDays}
                onChange={(event) => setTrialDays(event.target.value)}
                placeholder="none"
                className="tabular-nums"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to start them paying immediately.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !ready}>
              {isPending ? "Creating..." : "Create company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCompanyModal
