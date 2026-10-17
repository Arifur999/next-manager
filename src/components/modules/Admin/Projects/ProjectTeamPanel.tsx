"use client"

import {
  assignProjectMemberAction,
  removeProjectMemberAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_action"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IProjectMember } from "@/types/project.types"
import { projectMemberFormZodSchema, type IProjectMemberFormValues } from "@/zod/project.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { UserMinus, UserPlus, Users } from "lucide-react"
import { useState } from "react"
import { projectMembersQuery } from "@/queries/project.queries"
import { queryKeys } from "@/lib/queryKeys"
import { usersListQuery } from "@/queries/people.queries"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"

const emptyAssignment: IProjectMemberFormValues = { user_id: "", role_on_project: "" }

// Who is on a project shows on the team tab, the people overview and the
// member count on the project itself.
const teamKeys = [queryKeys.projectMembers.all, queryKeys.assignmentOverview.all, queryKeys.projects.all]

/** `canManage` is false for anybody the API refuses: the controls that change
 *  things come off rather than failing when pressed. */
const ProjectTeamPanel = ({
  projectId,
  canManage = true,
}: {
  projectId: string
  canManage?: boolean
}) => {
  const [memberToRemove, setMemberToRemove] = useState<IProjectMember | null>(null)

  const membersQuery = useQuery(projectMembersQuery(projectId))
  const { data: usersData } = useQuery(usersListQuery())

  const members = membersQuery.data?.data ?? []
  const users = ((usersData?.data ?? [])).filter((user) => user.status === "active")

  const { run: assignMember, isPending: isAssigning } = useActionMutation({
    action: assignProjectMemberAction,
    // The server updates the role when the person is already on the project,
    // so this is also how a role gets changed; hence "Saved".
    successMessage: "Saved",
    invalidateKeys: teamKeys,
    refresh: false,
  })

  const { run: removeMember, isPending: isRemoving } = useActionMutation({
    action: removeProjectMemberAction,
    successMessage: memberToRemove ? `${memberToRemove.user.full_name} removed from the project` : undefined,
    invalidateKeys: teamKeys,
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyAssignment,
    validators: { onSubmit: projectMemberFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await assignMember({ project_id: projectId, ...value })) formApi.reset()
    },
  })

  const handleRemove = async () => {
    if (memberToRemove && (await removeMember(memberToRemove.id))) setMemberToRemove(null)
  }

  // Somebody already on the project is still offered: re-assigning is how the
  // role gets changed, so hiding them would remove the only way to do it.
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Team on this project</CardTitle>
      </CardHeader>

      {canManage && (
      <div className="flex flex-wrap gap-2 border-b px-5 py-4">
        <form.Field name="user_id">
          {(field) => (
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isAssigning || users.length === 0}
            >
              <SelectTrigger className="min-w-0 flex-1" aria-label="Team member to assign">
                <SelectValue placeholder={users.length === 0 ? "Invite a team member first" : "Choose someone"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </form.Field>

        <form.Field name="role_on_project">
          {(field) => (
            <Input
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Role on this project"
              aria-label="Role on this project"
              className="w-44"
              disabled={isAssigning}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => projectMemberFormZodSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="button" onClick={() => void form.handleSubmit()} disabled={isAssigning || !isComplete}>
              <UserPlus className="size-4" />
              Assign
            </Button>
          )}
        </form.Subscribe>
      </div>
      )}

      <PanelState
        query={membersQuery}
        errorMessage="The team did not load."
        isEmpty={members.length === 0}
        empty={
          <EmptyState icon={Users} hint={canManage ? "Choose someone above to put them on this project." : undefined}>
            Nobody assigned yet.
          </EmptyState>
        }
      >
        <ul className="divide-y">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {initialsOf(member.user.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.role_on_project || member.user.role.replace(/_/g, " ")}
                </p>
              </div>

              {canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMemberToRemove(member)}
              >
                <UserMinus className="size-4" />
                <span className="sr-only">Remove {member.user.full_name}</span>
              </Button>
              )}
            </li>
          ))}
        </ul>
      </PanelState>

      <ConfirmDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
        title="Remove from this project?"
        description={
          <>
            <span className="font-medium text-foreground">{memberToRemove?.user.full_name}</span> comes
            off the team for this project. Their tasks and logged hours stay as they are.
          </>
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
      />
    </Card>
  )
}

export default ProjectTeamPanel
