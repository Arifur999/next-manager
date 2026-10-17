"use client"

import { describeStageEvent } from "@/components/modules/Admin/Leads/stages"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatDateTime } from "@/lib/dates"
import { leadStageEventsQuery } from "@/queries/crm.queries"
import { usersListQuery } from "@/queries/people.queries"
import type { ILead } from "@/types/crm.types"
import { useQuery } from "@tanstack/react-query"
import { History } from "lucide-react"

type LeadHistorySheetProps = {
  lead: ILead
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Every stage a lead has been in, oldest first, so how long each step took can be read off it.
const LeadHistorySheet = ({ lead, open, onOpenChange }: LeadHistorySheetProps) => {
  const eventsQuery = useQuery({ ...leadStageEventsQuery(lead.id), enabled: open })
  const usersQuery = useQuery({ ...usersListQuery(), enabled: open })

  const events = eventsQuery.data?.data ?? []
  const nameOf = (userId: string | null) =>
    usersQuery.data?.data.find((person) => person.id === userId)?.full_name ?? "Someone"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pr-14">
          <SheetTitle>History of {lead.name}</SheetTitle>
          <SheetDescription>Every stage this deal has been in, oldest first.</SheetDescription>
        </SheetHeader>

        <PanelState
          query={eventsQuery}
          errorMessage="The history did not load."
          isEmpty={events.length === 0}
          empty={<EmptyState icon={History}>No stage changes recorded yet.</EmptyState>}
        >
          <ol className="divide-y">
            {events.map((event) => (
              <li key={event.id} className="px-6 py-3">
                <p className="text-sm font-medium">{describeStageEvent(event)}</p>
                <p className="text-xs text-muted-foreground">
                  {nameOf(event.changed_by)} · {formatDateTime(event.changed_at)}
                </p>
              </li>
            ))}
          </ol>
        </PanelState>
      </SheetContent>
    </Sheet>
  )
}

export default LeadHistorySheet
