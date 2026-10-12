import { TRACE_INVOICE_TOTAL_USD, TRACE_JOB, type TraceStepId } from "@/data/home/ledgerTrace"
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { Check, CircleDashed, Clock } from "lucide-react"
import type { ReactNode } from "react"
import { Marked } from "../Frame/MarkerNote"

const Row = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => (
  <div className={cn("flex items-baseline justify-between gap-3 py-1.5", className)}>
    <dt className="shrink-0 text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right tabular-nums">{children}</dd>
  </div>
)

const Chip = ({ tone, icon, children }: { tone: "done" | "review" | "open"; icon: ReactNode; children: ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-medium",
      tone === "done" && "bg-success-subtle text-success-subtle-foreground",
      tone === "review" && "bg-info-subtle text-info-subtle-foreground",
      tone === "open" && "bg-muted text-muted-foreground",
    )}
  >
    {icon}
    {children}
  </span>
)

const done = <Check aria-hidden="true" className="size-3" />
const review = <Clock aria-hidden="true" className="size-3" />
const open = <CircleDashed aria-hidden="true" className="size-3" />

const hoursUsd = TRACE_JOB.hourlyRateUsd * TRACE_JOB.approvedHours
const bdt = TRACE_INVOICE_TOTAL_USD * TRACE_JOB.exchangeRate

const CONTENT: Record<TraceStepId, ReactNode> = {
  lead: (
    <>
      <p className="line-clamp-2 font-medium">{TRACE_JOB.client}</p>
      <dl className="mt-2 divide-y">
        <Row label="Stage">
          <Chip tone="done" icon={done}>Won</Chip>
        </Row>
        <Row label="Source">Referral</Row>
        <Row label="Estimate">{formatUsd(9600)}</Row>
      </dl>
    </>
  ),
  project: (
    <>
      <p className="truncate font-medium">{TRACE_JOB.project}</p>
      <ul className="mt-2 divide-y">
        <li className="flex items-center justify-between gap-2 py-1.5">
          Discovery <Chip tone="done" icon={done}>Accepted</Chip>
        </li>
        <li className="flex items-center justify-between gap-2 py-1.5">
          Design <Chip tone="review" icon={review}>Submitted</Chip>
        </li>
        <li className="flex items-center justify-between gap-2 py-1.5">
          Build <Chip tone="open" icon={open}>Open</Chip>
        </li>
      </ul>
    </>
  ),
  hours: (
    <>
      <p className="truncate font-medium">{TRACE_JOB.person}</p>
      <dl className="mt-2 divide-y">
        <Row label="Milestone">Design</Row>
        <Row label="Logged">{TRACE_JOB.approvedHours} h</Row>
        <Row label="Status">
          <Chip tone="done" icon={done}>Approved</Chip>
        </Row>
      </dl>
    </>
  ),
  invoice: (
    <>
      <p className="font-mono font-medium">{TRACE_JOB.invoiceNumber}</p>
      <dl className="mt-2 divide-y">
        <Row label="Design">{formatUsd(TRACE_JOB.milestoneUsd)}</Row>
        <Row label={`${TRACE_JOB.approvedHours} h`}>{formatUsd(hoursUsd)}</Row>
        <Row label="Total" className="font-medium">
          <Marked n={1}>{formatUsd(TRACE_INVOICE_TOTAL_USD)}</Marked>
        </Row>
      </dl>
    </>
  ),
  payment: (
    <>
      <p className="truncate font-medium">Paid in full</p>
      <dl className="mt-2 divide-y">
        <Row label="USD in">{formatUsd(TRACE_INVOICE_TOTAL_USD)}</Row>
        <Row label="Rate">{formatRate(TRACE_JOB.exchangeRate)}</Row>
        <Row label="BDT">
          <Marked n={2}>{formatBdt(bdt)}</Marked>
        </Row>
      </dl>
    </>
  ),
}

const TraceFrame = ({ id, module }: { id: TraceStepId; module: string }) => (
  <div className="overflow-hidden rounded-lg border bg-card text-xs text-card-foreground shadow-frame">
    <p className="border-b bg-muted/60 px-3 py-2 font-medium">{module}</p>
    <div className="font-condensed px-3 py-2.5">{CONTENT[id]}</div>
  </div>
)

export default TraceFrame
