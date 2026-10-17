"use client"

import PageHeader from "@/components/shared/PageHeader"
import { pickAllowed } from "@/lib/queryString"
import { CLIENT_STATUSES } from "@/types/crm.types"
import { useSearchParams } from "next/navigation"

// Reads the status from the URL rather than from the page: the table changes
// it in place, without a server render, and the heading has to follow.
const ClientsHeading = () => {
  const status = pickAllowed(useSearchParams().get("status"), CLIENT_STATUSES)

  return (
    <PageHeader title={status ? `${status[0].toUpperCase()}${status.slice(1)} clients` : "Clients"}>
      {status === "archived"
        ? "Kept, not deleted — their projects, invoices and payments are all still here."
        : "Everyone the agency bills. Projects, invoices and payments all hang off these."}
    </PageHeader>
  )
}

export default ClientsHeading
