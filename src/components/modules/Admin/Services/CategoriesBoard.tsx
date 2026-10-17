"use client"

import {
  createCategoryAction,
  deleteCategoryAction,
  setCategoryActiveAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IServiceCategory } from "@/types/catalog.types"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Power, Trash2 } from "lucide-react"
import { useState } from "react"
import { serviceCategoriesQuery } from "@/queries/catalog.queries"
import { queryKeys } from "@/lib/queryKeys"

// The catalogue shows each service's category, so it moves with these.
const CATEGORY_KEYS = [queryKeys.serviceCategories.all, queryKeys.services.all]

/**
 * How the catalogue is grouped.
 *
 * Deleting one here behaves differently from every other list in the product,
 * and the screen says so: the services survive and become ungrouped. Grouping
 * is a tidying decision, and refusing it until somebody has moved every service
 * out by hand would make tidying harder than leaving it wrong.
 */
const CategoriesBoard = () => {
  const [name, setName] = useState("")
  const [removing, setRemoving] = useState<IServiceCategory | null>(null)

  const categoryList = useQuery(serviceCategoriesQuery())

  const categories = categoryList.data?.data ?? []

  // No toast when adding or switching: the list shows the change.
  const { run: addCategory, isPending } = useActionMutation({
    action: createCategoryAction,
    successMessage: false,
    invalidateKeys: CATEGORY_KEYS,
    refresh: false,
  })

  const { run: toggleActive } = useActionMutation({
    action: (category: IServiceCategory) =>
      setCategoryActiveAction(category.id, { is_active: !category.is_active }),
    successMessage: false,
    invalidateKeys: CATEGORY_KEYS,
    refresh: false,
  })

  // No successMessage: the server says how many services were left ungrouped.
  const { run: removeCategory, isPending: isRemoving } = useActionMutation({
    action: deleteCategoryAction,
    invalidateKeys: CATEGORY_KEYS,
    refresh: false,
  })

  const handleAdd = async () => {
    if (await addCategory({ name })) setName("")
  }

  const confirmRemove = async () => {
    if (removing && (await removeCategory(removing.id))) setRemoving(null)
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="space-y-3 border-b px-5 py-4">
          <div>
            <CardTitle className="text-base">Categories</CardTitle>
            <p className="text-sm text-muted-foreground">
              Grouping only. Removing one leaves its services in place, ungrouped — nothing
              is lost.
            </p>
          </div>

          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) return
              void handleAdd()
            }}
          >
            <Input
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Design, Development, Marketing…"
              className="min-w-0 flex-1"
              disabled={isPending}
              aria-label="New category name"
            />
            <Button type="submit" disabled={isPending || !name.trim()}>
              Add
            </Button>
          </form>
        </CardHeader>

        <PanelState
          query={categoryList}
          errorMessage="Categories did not load."
          isEmpty={categories.length === 0}
          empty={
            <EmptyState icon={FolderTree}>
              No categories yet. Services work perfectly well without one.
            </EmptyState>
          }
        >
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {category.name}
                    {!category.is_active && <Badge variant="outline">off</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category._count?.services ?? 0}{" "}
                    {(category._count?.services ?? 0) === 1 ? "service" : "services"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => void toggleActive(category)}
                    aria-label={
                      category.is_active ? `Turn off ${category.name}` : `Turn on ${category.name}`
                    }
                    title={category.is_active ? "Turn off" : "Turn on"}
                  >
                    <Power className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setRemoving(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </PanelState>
      </Card>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remove this category?"
        description={
          <>
            This removes <span className="font-medium text-foreground">{removing?.name}</span>. Its
            services stay in the catalogue, ungrouped.
          </>
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void confirmRemove()}
      />
    </>
  )
}

export default CategoriesBoard
