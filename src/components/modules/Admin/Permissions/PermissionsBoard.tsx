"use client"

import RolePermissionGrid from "@/components/modules/Admin/Permissions/RolePermissionGrid"
import UserPermissionGrid from "@/components/modules/Admin/Permissions/UserPermissionGrid"
import { usePermissionGrid } from "@/components/shared/permission/usePermissionGrid"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { roleTitle } from "@/types/permission.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { usersListQuery } from "@/queries/people.queries"
import { permissionGridQuery } from "@/queries/workspace.queries"

// Role templates and per-person exceptions. Nothing here can widen access: the role
// gate runs first and these only narrow inside it, and no scope reaches another company.

const PermissionsBoard = () => {
  const [personId, setPersonId] = useState<string>("")

  const roleGrid = usePermissionGrid()
  const personGrid = usePermissionGrid(personId || undefined)
  // The same cached read as roleGrid, observed for the error and refetch the hook does not return.
  const gridRead = useQuery(permissionGridQuery())

  const userList = useQuery(usersListQuery())

  // An admin passes every check by design, so an override stored against one
  // would look like a restriction and enforce nothing.
  const people = (userList.data?.data ?? []).filter((user) => user.role !== "admin")

  if (gridRead.isError && !roleGrid.grid) {
    return (
      <Card>
        <ErrorState
          message="The permission grid did not load."
          onRetry={() => void gridRead.refetch()}
          isRetrying={gridRead.isFetching}
        />
      </Card>
    )
  }

  // A local, so the narrowing from the check above holds inside the closures below.
  const grid = roleGrid.grid
  if (!grid) return <LoadingBlock height="h-96" rounded />

  const roles = grid.roles

  return (
    <Tabs defaultValue="roles" className="space-y-4">
      <TabsList>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="person">One person</TabsTrigger>
      </TabsList>

      <TabsContent value="roles" className="space-y-4">
        <Tabs defaultValue={roles[0]} className="space-y-4">
          <TabsList>
            {roles.map((role) => (
              <TabsTrigger key={role} value={role}>
                {roleTitle(role)}
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map((role) => (
            <TabsContent key={role} value={role}>
              <Card className="gap-0 overflow-hidden p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-base">
                    {roleTitle(role)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Everybody in this role, unless they have been given an exception on
                    the next tab. Each square saves as you change it.
                  </p>
                </CardHeader>

                <CardContent className="p-0">
                  <RolePermissionGrid
                    grid={grid}
                    role={role}
                    disabled={roleGrid.isBusy}
                    save={roleGrid.save}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value="person" className="space-y-4">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">One person</CardTitle>
            <p className="text-sm text-muted-foreground">
              An exception for somebody whose job does not quite match their role.
              Everything starts on Inherit, and putting a square back to Inherit removes
              the exception rather than freezing today&apos;s answer.
            </p>

            <div className="pt-2">
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger className="w-full sm:w-80" aria-label="Choose somebody">
                  <SelectValue placeholder="Choose somebody" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                      <span className="text-muted-foreground">
                        {" "}
                        — {roleTitle(user.role)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {!personId ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Choose somebody to see where they differ from their role.
              </p>
            ) : personGrid.grid?.user ? (
              <UserPermissionGrid
                grid={personGrid.grid}
                disabled={personGrid.isBusy}
                save={personGrid.save}
              />
            ) : (
              <div className="h-64 animate-pulse bg-muted/40" />
            )}
          </CardContent>
        </Card>

        {people.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nobody to set an exception for yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default PermissionsBoard
