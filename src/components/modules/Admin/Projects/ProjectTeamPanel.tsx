"use client"

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
import {
  assignProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IProjectMember } from "@/types/agencio.types"
import type { IUser } from "@/types/user.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserMinus, UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"

const ProjectTeamPanel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState("")
  const [roleOnProject, setRoleOnProject] = useState("")

  const { data: membersData } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembers(projectId),
  })
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  })

  const members = (membersData?.data ?? []) as IProjectMember[]
  const users = ((usersData?.data ?? []) as IUser[]).filter((user) => user.is_active)

  const { mutateAsync: assign, isPending: isAssigning } = useMutation({
    mutationFn: () =>
      assignProjectMember({ project_id: projectId, user_id: userId, role_on_project: roleOnProject }),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: string) => removeProjectMember(id),
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["project-members", projectId] })
    void queryClient.invalidateQueries({ queryKey: ["assignment-overview"] })
    void queryClient.invalidateQueries({ queryKey: ["project", projectId] })
  }

  const handleAssign = async () => {
    if (!userId) return

    const result = await assign()

    if (!result.success) {
      toast.error(result.message || "Failed to assign")
      return
    }

    // The server updates the role when the person is already on the project, so
    // this is also how a role gets changed — hence the wording.
    toast.success("Saved")
    setUserId("")
    setRoleOnProject("")
    refresh()
  }

  const handleRemove = async (member: IProjectMember) => {
    const result = await remove(member.id)

    if (!result.success) {
      toast.error(result.message || "Failed to remove")
      return
    }

    toast.success(`${member.user.full_name} removed from the project`)
    refresh()
  }

  // Somebody already on the project is still offered: re-assigning is how the
  // role gets changed, so hiding them would remove the only way to do it.
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Team on this project</CardTitle>
      </CardHeader>

      <div className="flex flex-wrap gap-2 border-b px-5 py-4">
        <Select value={userId} onValueChange={setUserId} disabled={isAssigning || users.length === 0}>
          <SelectTrigger className="min-w-0 flex-1">
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

        <Input
          value={roleOnProject}
          onChange={(event) => setRoleOnProject(event.target.value)}
          placeholder="Role on this project"
          className="w-44"
          disabled={isAssigning}
        />

        <Button type="button" onClick={() => void handleAssign()} disabled={isAssigning || !userId}>
          <UserPlus className="size-4" />
          Assign
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Nobody assigned yet.
        </p>
      ) : (
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

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleRemove(member)}
              >
                <UserMinus className="size-4" />
                <span className="sr-only">Remove {member.user.full_name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ProjectTeamPanel
