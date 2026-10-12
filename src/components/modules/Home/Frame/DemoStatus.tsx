import { DEMO_STATUS_LABEL, type DemoInvoiceStatus } from "@/data/home/productDemo"
import { cn } from "@/lib/utils"
import { AlertTriangle, Check, Send } from "lucide-react"

const STYLE: Record<DemoInvoiceStatus, string> = {
  paid: "bg-success-subtle text-success-subtle-foreground",
  sent: "bg-info-subtle text-info-subtle-foreground",
  overdue: "bg-destructive-subtle text-destructive-subtle-foreground",
}

const ICON = { paid: Check, sent: Send, overdue: AlertTriangle } as const

// Status always carries an icon and a word, never colour alone.
const DemoStatus = ({ status }: { status: DemoInvoiceStatus }) => {
  const Icon = ICON[status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium", STYLE[status])}>
      <Icon aria-hidden="true" className="size-3" />
      {DEMO_STATUS_LABEL[status]}
    </span>
  )
}

export default DemoStatus
