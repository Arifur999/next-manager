"use client"

import { convertLeadAction, moveLeadAction } from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatUsd } from "@/lib/currency"
import { LEAD_STAGES, type ILead, type LeadStage } from "@/types/crm.types"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { queryKeys } from "@/lib/queryKeys"

// Only the open stages get a column. Won and lost are outcomes, not places work
// sits, and giving them columns would make the board grow forever.
const LeadCard = ({ lead }: { lead: ILead }) => {
  const router = useRouter()

  // The card landing in its new column is the confirmation.
  const { run: moveLead, isPending: isMoving } = useActionMutation({
    action: (stage: LeadStage) => moveLeadAction(lead.id, { stage }),
    successMessage: false,
    invalidateKeys: [queryKeys.leads.all],
    refresh: false,
  })

  const { run: convertLead, isPending: isConverting } = useActionMutation({
    action: convertLeadAction,
    successMessage: "Converted to a client",
    invalidateKeys: [queryKeys.leads.all, queryKeys.clients.all],
    refresh: false,
  })

  const handleConvert = async () => {
    if (await convertLead(lead.id)) router.push("/admin/dashboard/clients")
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
            {LEAD_STAGES.filter((stage) => stage !== lead.stage).map((stage) => (
              <DropdownMenuItem key={stage} onClick={() => void moveLead(stage)}>
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
