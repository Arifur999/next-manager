"use client"

import { getAccessLogAction } from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ICredential, ICredentialAccessEntry } from "@/types/workspace.types"
import { useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import { History, User } from "lucide-react"
import { useState } from "react"

const ACTION_LABEL: Record<string, string> = {
  created: "added it",
  updated: "changed it",
  viewed: "opened it",
  revealed: "revealed the password",
  deleted: "deleted it",
}

// Who has touched one credential. Fetched each time it is opened, never with the list.
const AccessLogDialog = ({ credential }: { credential: ICredential }) => {
  const [logOpen, setLogOpen] = useState(false)
  const [log, setLog] = useState<ICredentialAccessEntry[]>([])

  const { mutateAsync: loadLog, isPending: isLoadingLog } = useMutation({
    mutationFn: () => getAccessLogAction(credential.id),
  })

  const handleOpenLog = async () => {
    setLogOpen(true)
    const result = await loadLog()
    if (result.success && "data" in result) {
      setLog(result.data)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={() => void handleOpenLog()}
      >
        <History className="size-3.5" />
        Access log
      </Button>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Access log</DialogTitle>
            <DialogDescription>
              Who has touched {credential.label}, newest first. Append-only — nobody can edit this.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(80vh-6rem)] overflow-y-auto">
            {isLoadingLog ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : log.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="divide-y">
                {log.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-6 py-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{entry.user?.full_name ?? "Someone"}</span>{" "}
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        {entry.ip ? ` · ${entry.ip}` : ""}
                      </p>
                    </div>
                    {entry.action === "revealed" && (
                      <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                        revealed
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AccessLogDialog
