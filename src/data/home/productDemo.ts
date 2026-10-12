// Sample workspace shown inside product frames on the landing page. Invented
// on purpose and labelled "Sample data" wherever it renders: these are not
// customers. Long names and two currencies are here to show edge cases.

export type DemoInvoiceStatus = "paid" | "sent" | "overdue"

export interface IDemoInvoice {
  number: string
  client: string
  status: DemoInvoiceStatus
  amountUsd: number
  due: string
}

export const DEMO_WORKSPACE = "Northwind Studio"

export const DEMO_KPIS = {
  unpaidUsd: 18240,
  unpaidCount: 7,
  overdueCount: 2,
  bdtAccountName: "Operating account",
  bdtBalance: 1284500,
  hoursAwaiting: 46.5,
  hoursPeople: 4,
} as const

export const DEMO_INVOICES: IDemoInvoice[] = [
  { number: "INV-2041", client: "Riverside Dental and Orthodontic Partners", status: "overdue", amountUsd: 4820, due: "3 Oct" },
  { number: "INV-2044", client: "Chowdhury and Sen Architects", status: "sent", amountUsd: 7400, due: "18 Oct" },
  { number: "INV-2043", client: "Kowloon Noodle Bar", status: "paid", amountUsd: 1250, due: "9 Oct" },
]

export const DEMO_STATUS_LABEL: Record<DemoInvoiceStatus, string> = {
  paid: "Paid",
  sent: "Sent",
  overdue: "Overdue",
}
