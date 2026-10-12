import { formatUsd } from "@/lib/currency"
import FrameChrome from "../../Frame/FrameChrome"

const COLUMNS = [
  { stage: "New", leads: [{ name: "Harbour Physio Clinic", source: "Website", value: 3200 }, { name: "Dhanmondi Book Cafe", source: "Referral", value: 1800 }] },
  { stage: "Contacted", leads: [{ name: "Patel and Wong Accountants", source: "Event", value: 5400 }] },
  { stage: "Proposal", leads: [{ name: "Greenline Logistics", source: "Referral", value: 12800 }, { name: "Saint Albans Primary School", source: "Website", value: 4100 }] },
  { stage: "Won", leads: [{ name: "Riverside Dental and Orthodontic Partners", source: "Referral", value: 9600 }] },
]

const PipelineCrop = () => (
  <FrameChrome title="Leads / Pipeline" label="A lead pipeline with four stages, sample data">
    <div role="region" aria-label="Lead pipeline, scrolls sideways" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
      <div className="grid min-w-[40rem] grid-cols-4 divide-x text-xs">
        {COLUMNS.map((column) => (
          <div key={column.stage} className="min-w-0 p-3">
            <p className="flex items-center justify-between font-medium">
              {column.stage}
              <span className="text-muted-foreground tabular-nums">{column.leads.length}</span>
            </p>
            <ul className="mt-2 space-y-2">
              {column.leads.map((lead) => (
                <li key={lead.name} className="rounded-md border bg-background p-2.5">
                  <p className="line-clamp-2 font-medium">{lead.name}</p>
                  <p className="mt-1 flex justify-between gap-2 text-muted-foreground">
                    <span>{lead.source}</span>
                    <span className="tabular-nums">{formatUsd(lead.value)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </FrameChrome>
)

export default PipelineCrop
