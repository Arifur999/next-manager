"use client"

import { OPEN_STAGES } from "@/components/modules/Admin/Leads/stages"
import CreateLeadModal from "@/components/modules/Admin/Leads/CreateLeadModal"
import LeadCard from "@/components/modules/Admin/Leads/LeadCard"
import StatTile from "@/components/shared/StatTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { getLeadPipeline } from "@/services/agencio.services"
import type { ILeadPipeline, LeadStage } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { Target, TrendingUp } from "lucide-react"

// Only the open stages get a column. Won and lost are outcomes, not places work
// sits, and giving them columns would make the board grow forever.
const LeadPipeline = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeadPipeline(),
  })

  const pipeline = data?.data as ILeadPipeline | undefined
  const byStage = (stage: LeadStage) =>
    pipeline?.stages.find((entry) => entry.stage === stage)?.leads ?? []

  const won = byStage("won")
  const lost = byStage("lost")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="Open pipeline"
            value={formatUsd(pipeline?.open_value_usd ?? 0)}
            // Won and lost are excluded on purpose: including them would make
            // this number grow forever and stop meaning anything.
            hint={`${pipeline?.open_count ?? 0} open deal${pipeline?.open_count === 1 ? "" : "s"} · won and lost excluded`}
            icon={<TrendingUp className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Closed"
            value={`${won.length} won · ${lost.length} lost`}
            hint={
              won.length + lost.length > 0
                ? `${Math.round((won.length / (won.length + lost.length)) * 100)}% win rate`
                : "Nothing closed yet"
            }
            icon={<Target className="size-5" />}
            tone={3}
          />
        </div>

        <CreateLeadModal />
      </div>

      {isLoading && !pipeline ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {OPEN_STAGES.map((column) => (
            <Card key={column.stage} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {OPEN_STAGES.map((column) => {
            const leads = byStage(column.stage)
            const value = leads.reduce((running, lead) => running + lead.estimated_value_usd, 0)

            return (
              <Card key={column.stage} className="gap-0 overflow-hidden p-0">
                <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                  <CardTitle className="text-sm">{column.label}</CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatUsd(value)}
                  </span>
                </CardHeader>

                <div className="space-y-2 p-3">
                  {leads.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : (
                    leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LeadPipeline
