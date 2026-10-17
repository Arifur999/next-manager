"use client"

import { deleteTemplateAction } from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import TemplateFormCard from "@/components/modules/Admin/Services/TemplateFormCard"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IServiceTemplate } from "@/types/catalog.types"
import { useQuery } from "@tanstack/react-query"
import { Boxes, Trash2 } from "lucide-react"
import { useState } from "react"
import { serviceTemplatesQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Named bundles, so a repeat offer is one pick rather than five.
 *
 * The total shown against a package is worked out from today's service prices
 * and labelled as an estimate — it is not stored, because what a bundle costs
 * is whatever its lines are actually sold at. Storing a second total would give
 * two answers to what the client owes.
 */
const TemplatesBoard = () => {
  const [removing, setRemoving] = useState<IServiceTemplate | null>(null)

  const packageList = useQuery(serviceTemplatesQuery())

  const templates = packageList.data?.data ?? []

  const { run: removePackage, isPending: isRemoving } = useActionMutation({
    action: deleteTemplateAction,
    successMessage: "Package removed",
    invalidateKeys: [queryKeys.serviceTemplates.all],
    refresh: false,
  })

  const confirmRemove = async () => {
    if (removing && (await removePackage(removing.id))) setRemoving(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <TemplateFormCard />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Packages</CardTitle>
        </CardHeader>

        <PanelState
          query={packageList}
          errorMessage="Packages did not load."
          isEmpty={templates.length === 0}
          empty={<EmptyState icon={Boxes}>No packages yet.</EmptyState>}
        >
          <ul className="divide-y">
            {templates.map((template) => {
              const estimate = template.items.reduce(
                (running, item) => running + item.quantity * item.service.default_price_usd,
                0
              )

              return (
                <li key={template.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-48 flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.items.length}{" "}
                        {template.items.length === 1 ? "service" : "services"}
                        {estimate > 0 && ` · about ${formatUsd(estimate)} at today's prices`}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRemoving(template)}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {template.items.map((item) => (
                      <Badge key={item.id} variant="secondary">
                        {item.quantity > 1 ? `${item.quantity} × ` : ""}
                        {item.service.name}
                        {!item.service.is_active && " (not sold)"}
                      </Badge>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </PanelState>
      </Card>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remove this package?"
        description={
          <>
            This removes the <span className="font-medium text-foreground">{removing?.name}</span>{" "}
            package. Invoices already raised from it keep their own lines, so nothing else changes.
          </>
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void confirmRemove()}
      />
    </div>
  )
}

export default TemplatesBoard
