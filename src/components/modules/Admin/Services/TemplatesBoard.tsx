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
import { plural } from "@/lib/text"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IServiceTemplate } from "@/types/catalog.types"
import { useQuery } from "@tanstack/react-query"
import { Boxes, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { serviceTemplatesQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"

// Named bundles, so a repeat offer is one pick. A package's total is an estimate
// from today's prices and never stored: a second total would be a second answer to what is owed.
// `canManage` (admin and sales) and `canDelete` (admin) follow the API's gates.
const TemplatesBoard = ({ canManage, canDelete }: { canManage: boolean; canDelete: boolean }) => {
  const [removing, setRemoving] = useState<IServiceTemplate | null>(null)
  const [editing, setEditing] = useState<IServiceTemplate | null>(null)

  const packageList = useQuery(serviceTemplatesQuery())

  const templates = packageList.data?.data ?? []

  const { run: removePackage, isPending: isRemoving } = useActionMutation({
    action: deleteTemplateAction,
    successMessage: "Package removed",
    invalidateKeys: [queryKeys.serviceTemplates.all],
    refresh: false,
  })

  const confirmRemove = async () => {
    if (!removing || !(await removePackage(removing.id))) return
    if (editing?.id === removing.id) setEditing(null)
    setRemoving(null)
  }

  return (
    <div className={canManage ? "grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]" : "grid gap-4"}>
      {/* One form at a time: editing a package takes the new-package card's place. */}
      {canManage && (
        <TemplateFormCard key={editing?.id ?? "new"} template={editing} onDone={() => setEditing(null)} />
      )}

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
                        {plural(template.items.length, "service")}
                        {estimate > 0 && ` · about ${formatUsd(estimate)} at today's prices`}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {canManage && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditing(template)}
                          aria-label={`Edit ${template.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setRemoving(template)}
                          aria-label={`Delete ${template.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
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
