"use client"

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/(dashboardLayout)/admin/dashboard/services/_action"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getServiceCategories } from "@/services/agencio.services"
import type { IServiceCategory } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderTree, Power, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * How the catalogue is grouped.
 *
 * Deleting one here behaves differently from every other list in the product,
 * and the screen says so: the services survive and become ungrouped. Grouping
 * is a tidying decision, and refusing it until somebody has moved every service
 * out by hand would make tidying harder than leaving it wrong.
 */
const CategoriesBoard = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => getServiceCategories(),
  })

  const categories = (data?.data ?? []) as IServiceCategory[]
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["service-categories"] })
    // The catalogue shows each service's category, so it moves with this.
    void queryClient.invalidateQueries({ queryKey: ["services"] })
  }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () => createCategoryAction({ name: name.trim() }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not add it")
        return
      }
      setName("")
      refresh()
    },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (category: IServiceCategory) =>
      updateCategoryAction(category.id, { is_active: !category.is_active }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not change it")
        return
      }
      refresh()
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not remove it")
        return
      }
      // The server says how many were left ungrouped, which is the part
      // somebody needs to know.
      toast.success(result.message)
      refresh()
    },
  })

  return (
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
            add()
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

      {isLoading && categories.length === 0 ? (
        <LoadingBlock />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree}>
          No categories yet. Services work perfectly well without one.
        </EmptyState>
      ) : (
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
                  onClick={() => toggle(category)}
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
                  onClick={() => remove(category.id)}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default CategoriesBoard
