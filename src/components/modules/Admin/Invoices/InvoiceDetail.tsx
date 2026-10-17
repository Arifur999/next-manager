"use client"

import InvoiceActions from "@/components/modules/Admin/Invoices/InvoiceActions"
import InvoiceLinesCard from "@/components/modules/Admin/Invoices/InvoiceLinesCard"
import { InvoicePaymentsCard, InvoiceSummaryCard } from "@/components/modules/Admin/Invoices/InvoiceSideCards"
import InvoiceStatusBadge from "@/components/modules/Admin/Invoices/InvoiceStatusBadge"
import PageHeader from "@/components/shared/PageHeader"
import ErrorState from "@/components/shared/state/ErrorState"
import { Card } from "@/components/ui/card"
import { invoiceDetailQuery } from "@/queries/billing.queries"
import { organizationQuery } from "@/queries/workspace.queries"
import type { IInvoice } from "@/types/billing.types"
import type { IOrganization } from "@/types/workspace.types"
import { useQuery } from "@tanstack/react-query"

const INVOICES_CRUMB = [{ label: "Invoices", href: "/admin/dashboard/invoices" }]

// Printed copy only: on screen the sidebar says whose agency this is, but a
// page sent to a client has to carry it. It reads the organization as it is
// now, so a renamed agency shows its new name on every invoice.
const InvoiceLetterhead = ({ invoice, organization }: { invoice: IInvoice; organization?: IOrganization }) => (
  <div className="hidden space-y-3 border-b pb-4 print:block">
    {organization && (
      <div>
        <p className="text-lg font-semibold">{organization.legal_name || organization.name}</p>
        <p className="text-sm text-muted-foreground">
          {[organization.email, organization.phone, organization.website].filter(Boolean).join(" · ")}
        </p>
        {organization.address && <p className="text-sm text-muted-foreground">{organization.address}</p>}
      </div>
    )}
    <div>
      <p className="text-xl font-semibold">Invoice {invoice.invoice_number}</p>
      <p className="text-sm">Billed to {invoice.client?.name}</p>
    </div>
  </div>
)

type InvoiceDetailProps = {
  invoiceId: string
  canRecordPayment: boolean
}

const InvoiceDetail = ({ invoiceId, canRecordPayment }: InvoiceDetailProps) => {
  const { data, isLoading, isFetching, refetch } = useQuery(invoiceDetailQuery(invoiceId))
  const { data: orgData } = useQuery(organizationQuery())

  const invoice = data?.data

  if (isLoading && !invoice) {
    return <Card className="h-64 animate-pulse bg-muted/40" />
  }

  // A missing invoice never gets here: the page answers it with not-found.
  // What is left is a read that failed, which Retry may fix.
  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice" breadcrumb={INVOICES_CRUMB} />
        <Card>
          <ErrorState message="This invoice did not load." onRetry={() => void refetch()} isRetrying={isFetching} />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-print="page">
      <InvoiceLetterhead invoice={invoice} organization={orgData?.data} />

      <div data-print="hide">
        <PageHeader
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              {invoice.invoice_number}
              <InvoiceStatusBadge invoice={invoice} />
            </span>
          }
          breadcrumb={INVOICES_CRUMB}
          actions={<InvoiceActions invoice={invoice} canRecordPayment={canRecordPayment} />}
        >
          {invoice.client?.name}
          {invoice.project ? ` · ${invoice.project.code}` : ""}
        </PageHeader>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvoiceLinesCard invoice={invoice} />
        </div>

        <div className="space-y-4">
          <InvoiceSummaryCard invoice={invoice} />
          <InvoicePaymentsCard invoice={invoice} />
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
