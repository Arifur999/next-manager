"use client"

import { setBaselineAction } from "@/app/(dashboardLayout)/admin/dashboard/projects/_milestoneAction"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProject } from "@/services/agencio.services"
import type { IProject } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Lock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The plan this project will be measured against.
 *
 * Frozen once, on purpose. The contract value is meant to move as the deal
 * changes — that movement IS the scope-change rate — so the baseline has to
 * stay still or there is nothing to measure drift from.
 *
 * Re-baselining is offered but made deliberate. A project re-baselined at its
 * current state always reads as perfectly on plan, which is the one way to
 * make this number lie without anybody noticing.
 */

const ProjectBaselineCard = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const [hours, setHours] = useState("")
  const [value, setValue] = useState("")
  const [replacing, setReplacing] = useState(false)

  const { data } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  })

  const project = data?.data as IProject | undefined
  const isBaselined = Boolean(project?.baseline_set_at)

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      setBaselineAction(projectId, {
        baseline_hours: Number(hours),
        ...(value.trim() === "" ? {} : { baseline_value_usd: Number(value) }),
        ...(isBaselined ? { replace_existing: true } : {}),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to set the baseline")
        return
      }
      toast.success(isBaselined ? "Baseline replaced" : "Baseline set")
      setHours("")
      setValue("")
      setReplacing(false)
      void queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      void queryClient.invalidateQueries({ queryKey: ["kpi"] })
    },
  })

  if (!project) return null

  const showForm = !isBaselined || replacing

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Baseline</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isBaselined
              ? `Frozen ${format(parseISO(project.baseline_set_at as string), "dd MMM yyyy")} — plan-vs-actual and scope drift are measured from here.`
              : "Freeze what was sold, so overrun and scope drift have an original to be measured from."}
          </p>
        </div>

        {isBaselined && !replacing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setReplacing(true)}>
            Replace
          </Button>
        )}
      </CardHeader>

      {isBaselined && (
        <div className="grid gap-4 border-b px-5 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Baseline hours</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold tabular-nums">
              <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {Number(project.baseline_hours).toFixed(1)} h
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Baseline value</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              ${Number(project.baseline_value_usd).toLocaleString()}
              {Number(project.contract_value_usd) !== Number(project.baseline_value_usd) && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  now ${Number(project.contract_value_usd).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <form
          className="flex flex-wrap items-end gap-3 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!hours.trim() || Number(hours) <= 0) return
            save()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="baseline-hours">Hours sold</Label>
            <Input
              id="baseline-hours"
              type="number"
              step="any"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder="120"
              className="w-32 tabular-nums"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="baseline-value">Value ($)</Label>
            <Input
              id="baseline-value"
              type="number"
              step="any"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              // Left blank it takes the contract as it stands, which at
              // kickoff is exactly what "what we sold" means.
              placeholder={Number(project.contract_value_usd).toLocaleString()}
              className="w-36 tabular-nums"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending || !hours.trim()}>
            {isBaselined ? "Replace baseline" : "Set baseline"}
          </Button>

          {replacing && (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => setReplacing(false)}
            >
              Cancel
            </Button>
          )}

          {replacing && (
            <p className="w-full text-xs text-muted-foreground">
              Replacing discards the original every overrun on this project is currently
              measured against.
            </p>
          )}
        </form>
      )}
    </Card>
  )
}

export default ProjectBaselineCard
