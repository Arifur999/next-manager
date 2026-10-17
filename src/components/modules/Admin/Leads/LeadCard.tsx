"use client"

import {
  convertLeadAction,
  deleteLeadAction,
  moveLeadAction,
} from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import CreateLeadModal from "@/components/modules/Admin/Leads/CreateLeadModal"
import LeadHistorySheet from "@/components/modules/Admin/Leads/LeadHistorySheet"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
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
import { queryKeys } from "@/lib/queryKeys"
import { sentenceCase } from "@/lib/text"
import { LEAD_STAGES, type ILead, type LeadStage } from "@/types/crm.types"
import { History, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type LeadCardProps = {
  lead: ILead
  /** The list does not carry the source, so the board looks its name up. */
  sourceName?: string
  /** Admin only, as at the API. */
  canDelete: boolean
}

const LeadCard = ({ lead, sourceName, canDelete }: LeadCardProps) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isShowingHistory, setIsShowingHistory] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const { run: removeLead, isPending: isRemoving } = useActionMutation({
    action: deleteLeadAction,
    successMessage: "Lead deleted",
    invalidateKeys: [queryKeys.leads.all],
    refresh: false,
  })

  const handleConvert = async () => {
    if (await convertLead(lead.id)) router.push("/admin/dashboard/clients")
  }

  const handleDelete = async () => {
    if (await removeLead(lead.id)) setIsDeleting(false)
  }

  const busy = isMoving || isConverting || isRemoving

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          {lead.company && <p className="truncate text-xs text-muted-foreground">{lead.company}</p>}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" disabled={busy}>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions for {lead.name}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsShowingHistory(true)}>
              <History />
              History
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Won and lost are offered too: closing a deal moves the card off the board. */}
            {LEAD_STAGES.filter((stage) => stage !== lead.stage).map((stage) => (
              <DropdownMenuItem key={stage} onClick={() => void moveLead(stage)}>
                Move to {sentenceCase(stage)}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void handleConvert()} disabled={Boolean(lead.converted_client_id)}>
              {lead.converted_client_id ? "Already converted" : "Convert to client"}
            </DropdownMenuItem>

            {canDelete && (
              <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleting(true)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium tabular-nums">{formatUsd(lead.estimated_value_usd)}</span>
        {sourceName && <span className="truncate text-xs text-muted-foreground">{sourceName}</span>}
      </div>

      <CreateLeadModal lead={lead} open={isEditing} onOpenChange={setIsEditing} />
      <LeadHistorySheet lead={lead} open={isShowingHistory} onOpenChange={setIsShowingHistory} />

      {canDelete && (
        <ConfirmDialog
          open={isDeleting}
          onOpenChange={setIsDeleting}
          title={`Delete ${lead.name}?`}
          description="It leaves the pipeline and every report that counts it. A client already converted from it stays."
          variant="destructive"
          confirmLabel="Delete"
          pendingLabel="Deleting..."
          isPending={isRemoving}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  )
}

export default LeadCard
