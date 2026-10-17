"use client"

import CreateInvoiceModal from "@/components/modules/Admin/Invoices/CreateInvoiceModal"
import { invoicesColumns } from "@/components/modules/Admin/Invoices/invoicesColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { formatUsd } from "@/lib/currency"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { invoicesListQuery } from "@/queries/billing.queries"

const InvoicesTable = () => {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const invoicesQuery = useQuery(invoicesListQuery(search ? `search=${encodeURIComponent(search)}` : undefined))

  const invoices = invoicesQuery.data?.data ?? []

  // Only what is actually owing counts as outstanding — a draft is not a claim
  // on anyone, and a cancelled one never was.
  const owing = invoices.filter(
    (invoice) => !["draft", "cancelled", "paid"].includes(invoice.status),
  )
  const outstanding = owing.reduce((running, invoice) => running + invoice.total, 0)
  const overdue = invoices.filter((invoice) => invoice.is_overdue)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Outstanding"
          value={formatUsd(outstanding)}
          hint={`${owing.length} invoice${owing.length === 1 ? "" : "s"} still owing`}
          icon={<FileText className="size-5" />}
          tone={1}
        />
        <StatTile
          label="Overdue"
          value={String(overdue.length)}
          secondary={formatUsd(overdue.reduce((running, invoice) => running + invoice.total, 0))}
          hint="Past the due date and not settled"
          icon={<AlertTriangle className="size-5" />}
          tone={4}
        />
      </div>

      <DataTable
        data={invoices}
        columns={invoicesColumns}
        tableId="invoices"
        {...toTableQueryProps(invoicesQuery)}
        emptyMessage="No invoices yet."
        toolbarAction={<CreateInvoiceModal />}
        search={{
          initialValue: search,
          placeholder: "Search invoice number or client...",
          onDebouncedChange: setSearch,
        }}
        actions={{
          onView: (invoice) => router.push(`/admin/dashboard/invoices/${invoice.id}`),
        }}
      />
    </div>
  )
}

export default InvoicesTable
