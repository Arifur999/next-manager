"use client"

import { ALL_STAGES } from "@/components/modules/Admin/Leads/stages"
import { convertLeadAction, updateLeadAction } from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatUsd } from "@/lib/currency"
import type { ILead, LeadStage } from "@/types/agencio.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Only the open stages get a column. Won and lost are outcomes, not places work
// sits, and giving them columns would make the board grow forever.
const LeadCard = ({ lead }: { lead: ILead }) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync: move, isPending: isMoving } = useMutation({
    mutationFn: (stage: LeadStage) => updateLeadAction(lead.id, { stage }),
  })

  const { mutateAsync: convert, isPending: isConverting } = useMutation({
    mutationFn: () => convertLeadAction(lead.id),
  })

  const handleMove = async (stage: LeadStage) => {
    const result = await move(stage)
    if (!result.success) {
      toast.error(result.message || "Failed to move lead")
      return
    }
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
  }

  const handleConvert = async () => {
    const result = await convert()

    if (!result.success) {
      toast.error(result.message || "Failed to convert lead")
      return
    }

    toast.success("Converted to a client")
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
    void queryClient.invalidateQueries({ queryKey: ["clients"] })
    router.push("/admin/dashboard/clients")
  }

  const busy = isMoving || isConverting

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          {lead.company && (
            <p className="truncate text-xs text-muted-foreground">{lead.company}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" disabled={busy}>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions for {lead.name}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {ALL_STAGES.filter((stage) => stage !== lead.stage).map((stage) => (
              <DropdownMenuItem key={stage} onClick={() => void handleMove(stage)}>
                Move to {stage}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => void handleConvert()}
              disabled={Boolean(lead.converted_client_id)}
            >
              {lead.converted_client_id ? "Already converted" : "Convert to client"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium tabular-nums">
          {formatUsd(lead.estimated_value_usd)}
        </span>
        {lead.source && (
          <span className="truncate text-[11px] text-muted-foreground">{lead.source.name}</span>
        )}
      </div>
    </div>
  )
}

export default LeadCard
