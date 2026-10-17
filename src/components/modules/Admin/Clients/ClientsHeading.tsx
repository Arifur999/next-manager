"use client"

import { pickAllowed } from "@/lib/queryString"
import { CLIENT_STATUSES } from "@/types/crm.types"
import { useSearchParams } from "next/navigation"

// Reads the status from the URL rather than from the page: the table changes
// it in place, without a server render, and the heading has to follow.
const ClientsHeading = () => {
  const status = pickAllowed(useSearchParams().get("status"), CLIENT_STATUSES)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {status ? `${status[0].toUpperCase()}${status.slice(1)} clients` : "Clients"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {status === "archived"
          ? "Kept, not deleted — their projects, invoices and payments are all still here."
          : "Everyone the agency bills. Projects, invoices and payments all hang off these."}
      </p>
    </div>
  )
}

export default ClientsHeading
